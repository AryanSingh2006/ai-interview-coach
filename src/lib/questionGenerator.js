/**
 * questionGenerator.js
 *
 * Generates interview questions using a two-layer approach:
 *
 *  Layer 1 — Deterministic Strategy Engine (CODE):
 *    determineQuestionStrategy() decides follow_up vs new_topic in pure JS.
 *    No LLM involvement in this decision. Hard-capped at exactly one
 *    follow-up per topic (see interviewHelpers.js MAX_FOLLOWUPS_PER_TOPIC).
 *
 *  Layer 2 — LLM Question Generation (GROQ):
 *    The LLM receives the strategy decision as a HARD INSTRUCTION and executes
 *    it — generating the actual question text. The LLM does NOT choose strategy.
 *
 * PUBLIC API (unchanged):
 *   generateFirstQuestion({ candidateProfile, interviewType, jobDescription })
 *   generateNextQuestion({ candidateProfile, interviewType, jobDescription, previousTurns, evaluations })
 *
 * INTERNAL EXPORTS (preserved):
 *   buildSystemPrompt, calculateAverageScore, buildDifficultyGuidance,
 *   extractWeaknessPatterns, getAllowedQuestionTypes, validateQuestionShape
 */

import { createJSONCompletion } from "@/lib/groq";
import {
  formatExperience,
  formatProjects,
  formatSeniorityGuidance,
  formatList,
  formatInterviewHistory,
  formatEvaluationHistory,
  extractFollowUpTopics,
  buildTopicCoverageContext,
  buildInterviewerMemory,
  buildCompressedHistorySummary,
  determineQuestionStrategy,
  selectNextCoverageTarget,
  extractWeaknessPatterns,
  SCORE_THRESHOLDS,
} from "@/lib/interviewHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const ALL_QUESTION_TYPES = [
  "behavioral",
  "technical",
  "coding",
  "system_design",
  "situational",
  "hr",
];

const QUESTION_TYPES_BY_INTERVIEW_TYPE = {
  technical: ["technical", "coding"],
  behavioral: ["behavioral", "situational", "hr"],
  system_design: ["system_design"],
  mixed: ALL_QUESTION_TYPES,
};

const SENIORITY_GUIDANCE = {
  intern:
    "Focus on fundamentals. Keep questions beginner-friendly and concept-focused rather than testing production edge cases or tradeoffs.",
  junior:
    "Focus on practical implementation. Ask how they would build or fix something concrete, not how they'd architect an entire system.",
  mid:
    "Focus on basic architecture and design decisions. Expect them to reason about structure, not just write code.",
  senior:
    "Focus on architecture and tradeoffs. Push for 'why' — alternatives considered, scaling concerns, failure modes.",
  lead:
    "Focus on architecture plus leadership. Mix technical tradeoffs with how they'd guide a team or resolve a technical disagreement.",
  principal:
    "Focus on organization-wide impact. Ask about decisions that affect multiple teams, long-term technical strategy, and cross-cutting tradeoffs.",
};

/** Seniority levels expected to handle (and benefit from) aggressive difficulty ramps. */
const SENIOR_LEVELS = new Set(["senior", "lead", "principal"]);
/** Seniority levels that should ramp more conservatively even on strong streaks. */
const JUNIOR_LEVELS = new Set(["intern", "junior"]);

const MIN_QUESTION_LENGTH = 10;
const MAX_QUESTION_LENGTH = 600;

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: generateFirstQuestion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates the opening question of an interview.
 * No history, no strategy decision needed — just a warm, grounded opener.
 *
 * @param {Object} params
 * @param {Object} params.candidateProfile
 * @param {string} params.interviewType
 * @param {string} params.jobDescription
 * @returns {Promise<{question:string, questionType:string}>}
 */
export async function generateFirstQuestion({ candidateProfile, interviewType, jobDescription }) {
  const allowedTypes = getAllowedQuestionTypes(interviewType);
  const systemPrompt = buildSystemPrompt({ interviewType, allowedTypes });

  const userPrompt = `This is the FIRST question of the interview. There is no history yet.

Start with something approachable that lets the candidate ease in, ideally grounded in their actual background rather than a generic warm-up. For example: ask about a specific project, a technology they've used recently, or a concrete challenge from their experience.

${formatSeniorityGuidance(candidateProfile?.experienceLevel)}

CANDIDATE PROFILE
Skills: ${formatList(candidateProfile?.skills)}
${formatExperience(candidateProfile?.experience)}
${formatProjects(candidateProfile?.projects)}

Job Description: ${jobDescription || "Not provided"}

Generate the opening question now.`;

  const result = await createJSONCompletion({
    systemPrompt,
    userPrompt,
    temperature: 0.4,
  });

  return validateQuestionShape(result, allowedTypes);
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: generateNextQuestion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generates the next question in an ongoing interview.
 *
 * This is the main entry point for the adaptive question engine. It:
 *  1. Builds an InterviewerMemory snapshot of current state.
 *  2. Runs the deterministic strategy engine to decide follow_up vs new_topic
 *     (hard-capped at one follow-up per topic).
 *  3. Selects a coverage target if new_topic is chosen (phase-aware,
 *     priority-area-aware, diversity-aware).
 *  4. Constructs a prompt that TELLS the LLM what strategy to execute,
 *     using a bounded window of recent turns/evaluations plus a compressed
 *     summary of everything older.
 *  5. Validates the LLM output.
 *
 * @param {Object} params
 * @param {Object} params.candidateProfile
 * @param {string} params.interviewType
 * @param {string} params.jobDescription
 * @param {Array}  params.previousTurns
 * @param {Array}  params.evaluations
 * @returns {Promise<{question:string, questionType:string}>}
 */
export async function generateNextQuestion({
  candidateProfile,
  interviewType,
  jobDescription,
  previousTurns = [],
  evaluations = [],
  // FUTURE: userMemory, learningPlan — add here as plain fields when ready.
  // No other code in this function needs to change to support that.
}) {
  const allowedTypes = getAllowedQuestionTypes(interviewType);
  const systemPrompt = buildSystemPrompt({ interviewType, allowedTypes });

  // ── Layer 1: Deterministic strategy ──────────────────────────────────────
  const memory = buildInterviewerMemory(
    previousTurns,
    evaluations,
    candidateProfile,
    jobDescription
  );

  // The strategy decision is made in CODE, not by the LLM.
  const strategyResult = determineQuestionStrategy(memory, evaluations);

  // If new topic, select the highest-priority uncovered area.
  const coverageTarget =
    strategyResult.strategy === "new_topic"
      ? selectNextCoverageTarget(memory)
      : null;

  // ── Shared prompt ingredients ─────────────────────────────────────────────
  const averageScore = calculateAverageScore(evaluations);
  const difficultyGuidance = buildDifficultyGuidance(
    evaluations,
    candidateProfile?.experienceLevel
  );
  const recurringWeaknesses = extractWeaknessPatterns(evaluations);
  const topicCoverageContext = buildTopicCoverageContext(
    previousTurns,
    evaluations,
    candidateProfile
  );
  const compressedSummary = buildCompressedHistorySummary(previousTurns, evaluations);
  const questionCount = previousTurns.length;

  // ── Layer 2: LLM executes the strategy ───────────────────────────────────
  const userPrompt = buildNextQuestionPrompt({
    candidateProfile,
    jobDescription,
    previousTurns,
    evaluations,
    questionCount,
    averageScore,
    difficultyGuidance,
    recurringWeaknesses,
    topicCoverageContext,
    compressedSummary,
    memory,
    strategyResult,
    coverageTarget,
  });

  const result = await createJSONCompletion({
    systemPrompt,
    userPrompt,
    temperature: 0.5,
  });

  return validateQuestionShape(result, allowedTypes);
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the system prompt shared by generateFirstQuestion and
 * generateNextQuestion. The system prompt describes the interviewer's
 * role, anti-repetition rules, and output format.
 *
 * The strategy decision (follow_up vs new_topic) is NOT in the system prompt —
 * it is injected per-turn into the user prompt where it can be overridden by
 * the deterministic engine.
 *
 * @param {Object} params
 * @param {string} params.interviewType
 * @param {string[]} params.allowedTypes
 * @returns {string}
 */
function buildSystemPrompt({ interviewType, allowedTypes }) {
  const readableInterviewType = (interviewType || "mixed").replace(/_/g, " ");

  return `You are an experienced, adaptive interviewer conducting a live ${readableInterviewType} interview. You ask exactly one question at a time.

YOUR ROLE
You are the question executor, not the strategy planner. The user message contains a STRATEGY INSTRUCTION that tells you whether to ask a FOLLOW-UP or a NEW TOPIC question. You MUST follow that instruction — it is a hard constraint determined by the interview engine, not a suggestion. The engine allows AT MOST ONE follow-up per topic — if you are told to ask a follow-up, assume this is the only one this topic will get, so make it count.

QUESTION QUALITY STANDARDS
1. Be specific and grounded. Reference the candidate's actual projects, skills, and experience rather than asking generic questions.
   - If a project lists Kafka, ask how they used Kafka in that project.
   - If their role was Backend Engineer, ask within backend concerns: APIs, databases, caching, auth.
2. Calibrate difficulty using the performance signal and seniority guidance in the user message.
3. Make follow-up questions genuinely deeper — not rephrases. A follow-up must probe a gap or a new dimension of the same topic.
4. When revisiting a weakness, approach it from a new angle. Don't restate an earlier question verbatim.
5. Favor DIVERSITY of concept across the interview. Never ask near-duplicate questions like "Tell me about JWT" → "Tell me about refresh tokens" → "Tell me about token rotation" back to back — those are the SAME topic to a real interviewer. Once a topic area is covered, move to a genuinely different domain (e.g. database design, caching, system design, security validation) rather than another micro-variant of the same concept.

REALISTIC INTERVIEW RHYTHM (illustrative — do not copy exactly)
Q1 New: Background/project warm-up
Q2 New: Core technical skill from their resume
Q3 Follow-up: Probe a gap from Q2 (the ONLY follow-up this topic gets)
Q4 New: Different technical domain entirely
Q5 New: Project deep dive
Q6 New: System design or architecture
Q7 Follow-up: Probe a tradeoff from Q6 (the ONLY follow-up this topic gets)
Q8 New: Weakness revisit (approached from new angle, several questions later — not immediately)

ANTI-REPETITION RULES (strict)
- Never repeat a previous question, even slightly rephrased.
- Never ask two questions that test the exact same underlying concept back-to-back, unless it is an explicit deeper follow-up.
- Revisiting a weakness LATER in the interview is allowed — it is not repetition if the angle is new.

ALLOWED QUESTION TYPES FOR THIS INTERVIEW
${allowedTypes.join(", ")}

OUTPUT FORMAT (strict — no markdown, no preamble, ONLY valid JSON)
{
  "question": "<the full question text, one question only>",
  "questionType": "<one of: ${allowedTypes.join(", ")}>"
}`;
}

/**
 * Builds the per-turn user prompt for generateNextQuestion.
 * This is where the deterministic strategy decision is injected as a hard
 * instruction, preventing the LLM from re-deciding strategy on its own.
 *
 * @param {Object} params  All the computed context values.
 * @returns {string}
 */
function buildNextQuestionPrompt({
  candidateProfile,
  jobDescription,
  previousTurns,
  evaluations,
  questionCount,
  averageScore,
  difficultyGuidance,
  recurringWeaknesses,
  topicCoverageContext,
  compressedSummary,
  memory,
  strategyResult,
  coverageTarget,
}) {
  const strategyBlock = buildStrategyBlock(strategyResult, coverageTarget, memory, evaluations);

  const phase = memory.interviewPhase;
  const phaseBlock = `INTERVIEW PHASE: ${phase.phase}/6 — ${phase.label}
Questions ${phase.from}${phase.to === Infinity ? "+" : `–${phase.to}`}. ${getPhaseGuidance(phase.phase)}`;

  const revisitBlock =
    memory.eligibleWeaknessRevisits.length > 0
      ? `WEAKNESS REVISIT ELIGIBLE (these topics were weak AND enough time has passed — consider revisiting from a new angle):\n${memory.eligibleWeaknessRevisits.map((t) => `  - ${t}`).join("\n")}`
      : "No weakness topics are eligible for revisit yet.";

  const summaryBlock = compressedSummary
    ? `${compressedSummary}\n`
    : "";

  return `${formatSeniorityGuidance(candidateProfile?.experienceLevel)}

CANDIDATE PROFILE
Skills: ${formatList(candidateProfile?.skills)}
${formatExperience(candidateProfile?.experience)}
${formatProjects(candidateProfile?.projects)}

Job Description: ${jobDescription || "Not provided"}

INTERVIEW PROGRESS
Question Number: ${questionCount + 1}

${phaseBlock}

${summaryBlock}INTERVIEW SO FAR (most recent questions and answers, in order)
${formatInterviewHistory(previousTurns)}

EVALUATION HISTORY (most recent — use feedback text to identify specific gaps, not just scores)
${formatEvaluationHistory(previousTurns, evaluations)}

PERFORMANCE SIGNAL
Average score so far: ${averageScore === null ? "N/A" : `${averageScore.toFixed(1)} / 10`}
${difficultyGuidance}

RECURRING WEAKNESSES (appeared in multiple low-scoring evaluations — revisit later, not immediately)
${recurringWeaknesses.length > 0 ? recurringWeaknesses.map((w) => `  - ${w}`).join("\n") : "None detected yet."}

${revisitBlock}

${topicCoverageContext}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${strategyBlock}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generate the question now. Output ONLY the JSON object.`;
}

/**
 * Builds the strategy instruction block that is injected into the user prompt.
 * This is the most important section — it tells the LLM what to do rather than
 * asking it to decide.
 *
 * @param {{ strategy: string, reason: string }} strategyResult
 * @param {{ type: string, value: string } | null} coverageTarget
 * @param {Object} memory
 * @param {Array} evaluations
 * @returns {string}
 */
function buildStrategyBlock(strategyResult, coverageTarget, memory, evaluations) {
  const { strategy, reason } = strategyResult;

  if (strategy === "follow_up") {
    const lastEval = Array.isArray(evaluations) ? evaluations[evaluations.length - 1] : null;
    const gapHints =
      Array.isArray(lastEval?.recommendedFollowUpTopics) && lastEval.recommendedFollowUpTopics.length > 0
        ? `\nSpecific gaps to probe: ${lastEval.recommendedFollowUpTopics.join(", ")}`
        : "";

    return `STRATEGY INSTRUCTION: FOLLOW-UP ← HARD CONSTRAINT (this is the ONLY follow-up this topic gets)
Reason: ${reason}

Ask a FOLLOW-UP question on the most recent topic: "${memory.lastTurnTag || "previous topic"}".${gapHints}

Requirements for this follow-up:
- Must probe a DEEPER or DIFFERENT dimension of the topic — not a restatement of the last question.
- Must target a specific knowledge gap identified in the last evaluation, if one exists.
- Must NOT be a rephrasing of any previous question.
- This is the ONLY follow-up this topic will get — after this, the strategy engine WILL force a new topic regardless of the answer. Make it count.`;
  }

  // strategy === "new_topic"
  const targetDescription = coverageTarget
    ? buildCoverageTargetDescription(coverageTarget)
    : "any uncovered technical area from the candidate's profile or job description";

  const exclusionNote = memory.lastTurnTag
    ? `\nDo NOT ask about: "${memory.lastTurnTag}" (just covered).`
    : "";

  const overusedNote =
    memory.overusedTopics.length > 0
      ? `\nDo NOT ask about these overused topics: ${memory.overusedTopics.join(", ")}.`
      : "";

  const diversityNote =
    memory.recentTopicTags?.length > 0
      ? `\nFor diversity, avoid these recently used topics if possible: ${memory.recentTopicTags.join(", ")}.`
      : "";

  return `STRATEGY INSTRUCTION: NEW TOPIC ← HARD CONSTRAINT
Reason: ${reason}

Ask a NEW TOPIC question. Move AWAY from the current topic and cover: ${targetDescription}.${exclusionNote}${overusedNote}${diversityNote}

Requirements for this new-topic question:
- Must be on a topic NOT recently covered (see TOPIC COVERAGE above).
- Should be grounded in the candidate's actual profile (their projects, skills, experience) wherever possible.
- Difficulty should match the PERFORMANCE SIGNAL above.`;
}

/**
 * Returns a human-readable description of what the coverage target means for
 * the LLM to act on.
 *
 * @param {{ type: string, value: string }} target
 * @returns {string}
 */
function buildCoverageTargetDescription(target) {
  switch (target.type) {
    case "skill":
      return `the candidate's resume skill: "${target.value}" (not yet covered in this interview)`;
    case "project":
      return `the candidate's project: "${target.value}" (not yet discussed)`;
    case "experience":
      return `the candidate's experience area: "${target.value}" (not yet explored)`;
    case "jd_requirement":
      return `a job-description requirement: "${target.value}" (relevant to the role, not yet assessed)`;
    case "priority_area":
      return `the major technical area "${target.value}" — this is a core interview coverage area that has not been touched at all yet; ground it in the candidate's resume/projects if there's a natural connection, otherwise ask it generally for the role`;
    case "weakness_revisit":
      return `a revisit of the weakness topic: "${target.value}" — approach from a NEW ANGLE, do not repeat the original question`;
    case "system_design":
      return "system design, architecture, or scalability (broad coverage area)";
    default:
      return target.value || "a new technical topic from the candidate's background";
  }
}

/**
 * Returns phase-specific guidance text injected into the prompt to steer the
 * LLM's question type and depth. Six phases — see PHASE_BOUNDARIES in
 * interviewHelpers.js for the question-number ranges.
 *
 * @param {number} phase  1 | 2 | 3 | 4 | 5 | 6
 * @returns {string}
 */
function getPhaseGuidance(phase) {
  const guidance = {
    1: "Focus on BREADTH — explore the candidate's background, projects, and key resume skills. Keep questions approachable. Avoid deep drilling in this phase.",
    2: "Focus on CORE TECHNICAL ASSESSMENT — probe fundamentals across multiple skills and the job-description requirements. Keep difficulty moderate but cover ground.",
    3: "Focus on DEEP TECHNICAL ASSESSMENT — harder, more specific technical probes with real implementation detail. Push past surface-level answers.",
    4: "Focus on SYSTEM DESIGN & SCALABILITY — architecture, scale, failure modes, distributed-systems tradeoffs. Prefer 'system_design' questionType where it fits. Push for 'why' on every answer.",
    5: "Focus on WEAKNESS VALIDATION — revisit previously identified weak areas from a NEW angle to verify whether the gap is real or was a one-off. Do not repeat the original question verbatim.",
    6: "Focus on WRAP-UP ASSESSMENT — close any remaining coverage gaps and gather final signal. Questions can be broader or more reflective (e.g. tradeoffs across the whole system, lessons learned) to round out the picture.",
  };
  return guidance[phase] || guidance[2];
}

// ─────────────────────────────────────────────────────────────────────────────
// SCORING / DIFFICULTY (v2 — trend, consistency, and seniority aware)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Calculates the mean score across all evaluations.
 * Returns null if no evaluations exist yet.
 *
 * @param {Array} evaluations
 * @returns {number|null}
 */
function calculateAverageScore(evaluations) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) return null;
  const total = evaluations.reduce((sum, e) => sum + (e?.score || 0), 0);
  return total / evaluations.length;
}

/**
 * Builds a difficulty instruction based on the last 3 scores' average, trend,
 * and consistency (spread), additionally weighted by seniority level.
 *
 * Replaces the old "just average the whole history" approach, which couldn't
 * tell the difference between a candidate who is steadily improving (3, 4, 5
 * — ramp up gently) versus one who is consistently excellent (9, 9, 9 — ramp
 * up aggressively) versus one who is consistently struggling (2, 2, 2 — pull
 * back to fundamentals).
 *
 * @param {Array} evaluations
 * @param {string} [experienceLevel]
 * @returns {string}
 */
function buildDifficultyGuidance(evaluations, experienceLevel) {
  const allScores = Array.isArray(evaluations)
    ? evaluations.map((e) => e?.score).filter((s) => typeof s === "number")
    : [];

  if (allScores.length === 0) {
    return "This is an early question — keep difficulty moderate and let the seniority calibration above set the baseline.";
  }

  const last3 = allScores.slice(-3);
  const avg3 = last3.reduce((a, b) => a + b, 0) / last3.length;
  const trend = last3.length >= 2 ? last3[last3.length - 1] - last3[0] : 0;
  const spread = Math.max(...last3) - Math.min(...last3);
  const isConsistent = spread <= 1.5;

  const isSeniorTrack = SENIOR_LEVELS.has(experienceLevel);
  const isJuniorTrack = JUNIOR_LEVELS.has(experienceLevel);

  // Consistently excellent → ramp aggressively.
  if (avg3 >= 9 && isConsistent) {
    return `Last ${last3.length} score(s) (${last3.join(", ")}) show consistent excellence. Increase difficulty AGGRESSIVELY — push into harder tradeoffs, edge cases, and failure modes${isSeniorTrack ? "; this candidate's seniority level can handle it" : ""}.`;
  }

  // Strong and consistent → ramp up meaningfully.
  if (avg3 >= SCORE_THRESHOLDS.STRONG && isConsistent) {
    return `Last ${last3.length} score(s) (${last3.join(", ")}) are consistently strong. Increase difficulty${isSeniorTrack ? " aggressively" : isJuniorTrack ? " moderately, one notch at a time" : " meaningfully"} on the next question.`;
  }

  // Strong but inconsistent → ramp up cautiously, signal is noisy.
  if (avg3 >= SCORE_THRESHOLDS.STRONG && !isConsistent) {
    return `Last ${last3.length} score(s) (${last3.join(", ")}) average strong but are inconsistent (spread ${spread.toFixed(1)}). Increase difficulty slightly while watching for whether strength holds.`;
  }

  // Consistently weak → pull back hard.
  if (avg3 <= 3 && isConsistent) {
    return `Last ${last3.length} score(s) (${last3.join(", ")}) show consistent struggle. Decrease difficulty significantly — ask a foundational question to rebuild signal before increasing complexity again.`;
  }

  // Low but improving → ramp up slowly.
  if (avg3 < SCORE_THRESHOLDS.WEAK && trend > 0) {
    return `Scores are low but improving (${last3.join(" → ")}, trend +${trend.toFixed(1)}). Increase difficulty SLOWLY — one small step up, not a jump.`;
  }

  // Low and flat/declining → pull back.
  if (avg3 < SCORE_THRESHOLDS.WEAK) {
    return `Last ${last3.length} score(s) (${last3.join(", ")}) remain low with no clear improvement. Decrease difficulty — ask a more foundational question to gather signal before increasing complexity again.`;
  }

  // Mid-range, improving.
  if (trend > 1) {
    return `Mid-range scores trending upward (${last3.join(" → ")}). Increase difficulty gradually.`;
  }

  // Mid-range, declining.
  if (trend < -1) {
    return `Mid-range scores trending downward (${last3.join(" → ")}). Hold difficulty steady, or ease back slightly.`;
  }

  // Mid-range, stable.
  return `Stable mid-range performance (${last3.join(", ")}). Keep difficulty roughly the same, with only a slight increase if the most recent answer was the strongest.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// QUESTION TYPE RULES (existing, preserved)
// ─────────────────────────────────────────────────────────────────────────────

function getAllowedQuestionTypes(interviewType) {
  return QUESTION_TYPES_BY_INTERVIEW_TYPE[interviewType] || ALL_QUESTION_TYPES;
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT VALIDATION (existing, preserved)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates the raw LLM output for question shape.
 * Throws descriptive errors on any validation failure — never trust raw LLM output.
 *
 * @param {*} result
 * @param {string[]} [allowedTypes]
 * @returns {{ question: string, questionType: string }}
 */
function validateQuestionShape(result, allowedTypes = ALL_QUESTION_TYPES) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error("Invalid question generation: response is not a JSON object.");
  }

  if (typeof result.question !== "string") {
    throw new Error("Invalid question generation: 'question' must be a string.");
  }

  const question = result.question.trim();

  if (question.length < MIN_QUESTION_LENGTH) {
    throw new Error(
      `Invalid question generation: question is too short (min ${MIN_QUESTION_LENGTH} characters).`
    );
  }

  if (question.length > MAX_QUESTION_LENGTH) {
    throw new Error(
      `Invalid question generation: question is too long (max ${MAX_QUESTION_LENGTH} characters).`
    );
  }

  if (typeof result.questionType !== "string") {
    throw new Error("Invalid question generation: 'questionType' must be a string.");
  }

  const questionType = result.questionType.trim().toLowerCase();

  if (!allowedTypes.includes(questionType)) {
    throw new Error(
      `Invalid question generation: 'questionType' must be one of ${allowedTypes.join(", ")}, got '${questionType}'.`
    );
  }

  return { question, questionType };
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export {
  buildSystemPrompt,
  calculateAverageScore,
  buildDifficultyGuidance,
  extractWeaknessPatterns,
  getAllowedQuestionTypes,
  validateQuestionShape,
};