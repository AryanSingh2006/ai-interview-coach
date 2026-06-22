/**
 * evaluateAnswer.js
 *
 * Evaluates a single candidate answer during an interview turn.
 *
 * KEY IMPROVEMENT (v3):
 *   recommendedFollowUpTopics is now suppressed in code whenever score >= 8,
 *   FULL STOP — not "score >= 8 AND weaknesses.length === 0". A 9/10 answer
 *   with one tiny weakness must still move the interview forward instead of
 *   spawning another follow-up topic. This is enforced as a hard code-level
 *   backstop (normalizeEvaluationShape), not left to the prompt alone.
 *
 * PUBLIC API (unchanged):
 *   evaluateAnswer({ question, answer, questionType, candidateProfile,
 *                    interviewType, jobDescription, previousTurns, previousEvaluations })
 *
 * OUTPUT SCHEMA (unchanged — DB compatible):
 *   {
 *     score: number,
 *     dimensionScores: Array<{ dimension, score, comment }>,
 *     strengths: string[],
 *     weaknesses: string[],
 *     recommendedFollowUpTopics: string[],
 *     feedback: string
 *   }
 */

import { createJSONCompletion } from "@/lib/groq";
import {
  SENIORITY_GUIDANCE,
  formatExperience,
  formatProjects,
  formatSeniorityGuidance,
  formatList,
  formatInterviewHistory,
  formatEvaluationHistory,
  SCORE_THRESHOLDS,
} from "@/lib/interviewHelpers";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The five dimensions every evaluation MUST include.
 * Keep in sync with the OUTPUT FORMAT block in buildEvaluatorSystemPrompt().
 */
const REQUIRED_DIMENSIONS = [
  "clarity",
  "technical_depth",
  "relevance",
  "communication",
  "problem_solving",
];

/**
 * Below this word count, the answer gets flagged as unusually short so the
 * model applies the SHORT-ANSWER RULE strictly rather than relying on
 * noticing brevity on its own.
 */
const SHORT_ANSWER_WORD_THRESHOLD = 12;

/**
 * Score at or above which follow-up topics are ALWAYS suppressed, no
 * exceptions. A strong answer should move the interview forward — a tiny
 * weakness in an otherwise-excellent answer is not grounds for another
 * follow-up question. This threshold is enforced in code in
 * normalizeEvaluationShape(), independent of what the LLM returns.
 */
const STRONG_SCORE_THRESHOLD = SCORE_THRESHOLDS.STRONG; // 8

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC: evaluateAnswer
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Evaluates a single candidate answer and returns a structured evaluation.
 *
 * @param {Object} params
 * @param {string} params.question
 * @param {string} params.answer
 * @param {string} params.questionType
 * @param {Object} [params.candidateProfile]
 * @param {string} [params.interviewType]
 * @param {string} [params.jobDescription]
 * @param {Array}  [params.previousTurns]
 * @param {Array}  [params.previousEvaluations]
 * @returns {Promise<{
 *   score: number,
 *   dimensionScores: Array<{dimension:string, score:number, comment:string}>,
 *   strengths: string[],
 *   weaknesses: string[],
 *   recommendedFollowUpTopics: string[],
 *   feedback: string
 * }>}
 */
export async function evaluateAnswer({
  question,
  answer,
  questionType,
  candidateProfile,
  interviewType,
  jobDescription,
  previousTurns = [],
  previousEvaluations = [],
}) {
  if (!question || !answer || !questionType) {
    throw new Error(
      "evaluateAnswer requires 'question', 'answer', and 'questionType'."
    );
  }

  const systemPrompt = buildEvaluatorSystemPrompt({
    interviewType,
    experienceLevel: candidateProfile?.experienceLevel,
  });

  // Compute word count in code — a short, unambiguous signal the prompt can
  // reference directly rather than asking the model to judge brevity on its own.
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const shortAnswerNote =
    wordCount < SHORT_ANSWER_WORD_THRESHOLD
      ? ` — this is a very short answer (under ${SHORT_ANSWER_WORD_THRESHOLD} words). Apply the SHORT-ANSWER RULE strictly unless this was a question that genuinely calls for a one-line answer.`
      : "";

  // formatInterviewHistory / formatEvaluationHistory internally cap to the
  // most recent turns — keeps this prompt bounded as the interview grows.
  const userPrompt = `${formatSeniorityGuidance(candidateProfile?.experienceLevel)}

CANDIDATE PROFILE
Skills: ${formatList(candidateProfile?.skills)}
${formatExperience(candidateProfile?.experience)}
${formatProjects(candidateProfile?.projects)}

Job Description: ${jobDescription || "Not provided"}

INTERVIEW SO FAR (context only — these are already evaluated, do NOT re-score them)
${formatInterviewHistory(previousTurns)}

PRIOR EVALUATIONS (context only)
${formatEvaluationHistory(previousTurns, previousEvaluations)}

NOW EVALUATE THIS ANSWER
Question Type: ${questionType}
Question: ${question}
Answer word count: ${wordCount}${shortAnswerNote}
Candidate's Answer: ${answer}

Evaluate ONLY the answer above. The profile, job description, and history are calibration context — they should NEVER substitute for judging this specific answer on its own merits.

FOLLOW-UP TOPIC RULE (important — strict, no exceptions):
- If overall score >= ${STRONG_SCORE_THRESHOLD}: set recommendedFollowUpTopics to []. This applies EVEN IF you also listed a minor weakness — a strong answer moves the interview forward, it does not spawn a follow-up.
- Only populate recommendedFollowUpTopics when score < ${STRONG_SCORE_THRESHOLD} and a specific gap was identified that genuinely warrants probing.
- Maximum 3 follow-up topics. Be selective — only flag real gaps, not every adjacent topic.`;

  const result = await createJSONCompletion({
    systemPrompt,
    userPrompt,
    temperature: 0.3,
  });

  validateEvaluationShape(result);

  return normalizeEvaluationShape(result);
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT BUILDING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds the system prompt for the evaluator LLM.
 * This prompt is stable across turns — only the user prompt changes per turn.
 *
 * @param {Object} params
 * @param {string} [params.interviewType]
 * @param {string} [params.experienceLevel]
 * @returns {string}
 */
function buildEvaluatorSystemPrompt({ interviewType, experienceLevel }) {
  const readableInterviewType = (interviewType || "mixed").replace(/_/g, " ");
  const seniorityRubric =
    SENIORITY_GUIDANCE[experienceLevel] || SENIORITY_GUIDANCE.mid;

  return `You are a senior hiring panel member evaluating a single answer in a live ${readableInterviewType} interview. Score the answer honestly and rigorously, the way a real hiring panel would — do not inflate scores out of politeness, and do not let an articulate but empty answer score well.

SENIORITY CALIBRATION (${experienceLevel || "mid"})
${seniorityRubric}
The SAME answer should NOT receive the same score regardless of seniority — calibrate strictly to the level above.

DOMAIN CALIBRATION
Infer the role's domain from the job description in the user message (e.g. backend, frontend, mobile, data, DevOps, full-stack) and weigh technical_depth and relevance accordingly:
- Backend-leaning roles: weigh API design, databases, security, scalability, and system reliability more heavily.
- Frontend-leaning roles: weigh UI/UX reasoning, accessibility, rendering/browser performance, and state management more heavily.
- If the job description doesn't clearly indicate a domain, evaluate generally without favoring either direction.

SHORT-ANSWER RULE (strict)
An answer that is a handful of words, restates the question without answering it, or is essentially "I don't know" should score no higher than 2-3/10 overall, regardless of any single correct keyword it happens to contain. The user message flags unusually short answers explicitly — apply this rule firmly when it does.

FACTUAL ACCURACY RULE
Technical correctness is more important than confidence. A confident but technically incorrect answer should receive a lower score than a hesitant but technically correct answer.
- Incorrect technical explanations must heavily reduce: technical_depth, relevance, and overall score.
- A technically incorrect answer should rarely score above 2/10 overall.
- Do not reward polished wording when the answer is fundamentally wrong.

SCORING DIMENSIONS (all five required, each scored 0-10, decimals allowed e.g. 7.5)
- clarity: Is the explanation structured and easy to follow, independent of whether it is correct?
- technical_depth: How deep and accurate is the technical content, calibrated to the seniority and domain rules above?
- relevance: Does the answer actually address what was asked, without padding or drifting off-topic?
- communication: Could this answer land with a non-expert stakeholder or teammate — is it well-articulated, not just technically correct?
- problem_solving: Does the candidate show a reasoning process (tradeoffs, edge cases, "why," debugging approach), not just a memorized fact?

FOLLOW-UP TOPIC GUIDANCE (strict — a real interviewer moves on from strong answers)
recommendedFollowUpTopics is the signal that tells the question engine where to probe next.
- Strong answer (score >= 8): ALWAYS set to []. This is unconditional — even a 9/10 answer with one small noted weakness gets []. Do not generate a follow-up just because a minor gap exists; a real interviewer would move on.
- Weak answer (score < 5): list 1-3 specific gaps worth probing.
- Mid-range answer (5-7.9): only list topics where a genuine gap was identified, not every related concept.
- Maximum: 3 topics. Minimum: 0. Be honest and selective.
This prevents the interview from drilling one topic endlessly due to unnecessary follow-up suggestions.

OUTPUT FORMAT (strict — ONLY a valid JSON object, no markdown, no preamble, no text outside the JSON)
{
  "score": <number 0-10, decimals allowed, overall>,
  "dimensionScores": [
    { "dimension": "clarity", "score": <number 0-10>, "comment": "<short comment>" },
    { "dimension": "technical_depth", "score": <number 0-10>, "comment": "<short comment>" },
    { "dimension": "relevance", "score": <number 0-10>, "comment": "<short comment>" },
    { "dimension": "communication", "score": <number 0-10>, "comment": "<short comment>" },
    { "dimension": "problem_solving", "score": <number 0-10>, "comment": "<short comment>" }
  ],
  "strengths": ["<short, specific strength from THIS answer>"],
  "weaknesses": ["<short, specific weakness from THIS answer>"],
  "recommendedFollowUpTopics": ["<topic Title Case — only include real gaps, e.g. 'JWT Security', and ALWAYS [] if score >= 8>"],
  "feedback": "<2-4 sentence overall feedback for the candidate>"
}
"strengths" and "weaknesses" may be empty arrays if genuinely not applicable.`;
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT VALIDATION — never trust raw LLM output
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Validates that the raw LLM response matches the required evaluation schema.
 * Throws descriptive errors on any violation.
 *
 * @param {*} result
 */
function validateEvaluationShape(result) {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new Error("Invalid evaluation: response is not a JSON object.");
  }

  if (typeof result.score !== "number" || result.score < 0 || result.score > 10) {
    throw new Error("Invalid evaluation: 'score' must be a number between 0 and 10.");
  }

  if (!Array.isArray(result.dimensionScores) || result.dimensionScores.length === 0) {
    throw new Error("Invalid evaluation: 'dimensionScores' must be a non-empty array.");
  }

  const seenDimensions = new Set();
  for (const dim of result.dimensionScores) {
    if (typeof dim.dimension !== "string" || !dim.dimension.trim()) {
      throw new Error("Invalid evaluation: each dimension score requires a 'dimension' name.");
    }
    if (typeof dim.score !== "number" || dim.score < 0 || dim.score > 10) {
      throw new Error(
        `Invalid evaluation: dimension '${dim.dimension}' has an invalid score.`
      );
    }
    seenDimensions.add(dim.dimension.trim().toLowerCase());
  }

  const missingDimensions = REQUIRED_DIMENSIONS.filter((d) => !seenDimensions.has(d));
  if (missingDimensions.length > 0) {
    throw new Error(
      `Invalid evaluation: missing required dimension(s): ${missingDimensions.join(", ")}.`
    );
  }

  if (!Array.isArray(result.strengths)) {
    throw new Error("Invalid evaluation: 'strengths' must be an array.");
  }
  if (!Array.isArray(result.weaknesses)) {
    throw new Error("Invalid evaluation: 'weaknesses' must be an array.");
  }
  if (!Array.isArray(result.recommendedFollowUpTopics)) {
    throw new Error("Invalid evaluation: 'recommendedFollowUpTopics' must be an array.");
  }

  if (typeof result.feedback !== "string" || !result.feedback.trim()) {
    throw new Error("Invalid evaluation: 'feedback' must be a non-empty string.");
  }

  // Cap follow-up topics at 3 — the prompt says max 3, but enforce in code too.
  if (result.recommendedFollowUpTopics.length > 3) {
    result.recommendedFollowUpTopics = result.recommendedFollowUpTopics.slice(0, 3);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OUTPUT NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalizes and cleans the raw LLM evaluation output into the final schema.
 *
 * KEY CHANGE (v3): the follow-up suppression rule is now `score >=
 * STRONG_SCORE_THRESHOLD` ONLY — it no longer also requires
 * `weaknesses.length === 0`. A 9/10 answer with a minor noted weakness still
 * gets recommendedFollowUpTopics cleared, because a real interviewer moves
 * the interview forward on strong answers regardless of small caveats.
 *
 * @param {Object} result  Validated raw LLM response.
 * @returns {Object}  Clean evaluation matching the output schema.
 */
function normalizeEvaluationShape(result) {
  const score = roundToOneDecimal(result.score);
  const weaknesses = cleanStringArray(result.weaknesses);
  let followUpTopics = cleanStringArray(result.recommendedFollowUpTopics);

  // Hard enforcement of follow-up suppression:
  // ANY answer scoring >= STRONG_SCORE_THRESHOLD clears follow-up topics,
  // regardless of whether minor weaknesses were also noted. This is the
  // code-level backstop the prompt alone cannot guarantee.
  if (score >= STRONG_SCORE_THRESHOLD) {
    followUpTopics = [];
  }

  // Respect the 3-topic cap after cleaning.
  if (followUpTopics.length > 3) {
    followUpTopics = followUpTopics.slice(0, 3);
  }

  return {
    score,
    dimensionScores: result.dimensionScores.map((dim) => ({
      dimension: dim.dimension.trim().toLowerCase(),
      score: roundToOneDecimal(dim.score),
      comment: typeof dim.comment === "string" ? dim.comment.trim() : "",
    })),
    strengths: cleanStringArray(result.strengths),
    weaknesses,
    recommendedFollowUpTopics: followUpTopics,
    feedback: result.feedback.trim(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// SMALL PRIVATE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function cleanStringArray(arr) {
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((item) => typeof item === "string" && item.trim().length > 0)
    .map((item) => item.trim());
}

function roundToOneDecimal(num) {
  return Math.round(num * 10) / 10;
}

export default evaluateAnswer;