/**
 * interviewHelpers.js
 *
 * Shared formatting, analysis, and strategy utilities for the AI Interview Coach engine.
 *
 * PUBLIC EXPORTS (all existing exports preserved for backward compatibility):
 *   SENIORITY_GUIDANCE
 *   formatExperience
 *   formatProjects
 *   formatSeniorityGuidance
 *   formatInterviewHistory
 *   formatEvaluationHistory
 *   formatList
 *   extractFollowUpTopics
 *   buildTopicCoverageContext
 *   truncate
 *   deriveTopicTag
 *   isSkippedAnswer
 *   getInterviewPhase
 *   getMostCoveredTopic
 *   getConsecutiveTopicCount
 *   getEligibleWeaknessRevisits
 *   selectNextCoverageTarget
 *   buildInterviewerMemory
 *   determineQuestionStrategy
 *   extractWeaknessPatterns
 *   SCORE_THRESHOLDS
 *   MAX_CONSECUTIVE_SAME_TOPIC
 *   MAX_QUESTIONS_PER_TOPIC
 *   WEAKNESS_REVISIT_DELAY
 *   WEAKNESS_KEYWORDS
 *
 * NEW EXPORTS (v3 — production-grade interviewer upgrade):
 *   buildCompressedHistorySummary
 *   getRecentTopicTags
 *   PRIORITY_COVERAGE_AREAS
 *   WEAKNESS_REVISIT_DELAY_MIN
 *   WEAKNESS_REVISIT_DELAY_MAX
 *   MAX_FOLLOWUPS_PER_TOPIC
 *   RECENT_TURNS_LIMIT
 *   RECENT_EVALS_LIMIT
 */

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const SENIORITY_GUIDANCE = {
  intern:
    "Grade against fundamentals only. A correct, clearly explained basic answer can score highly even without discussing tradeoffs, scale, or edge cases.",
  junior:
    "Grade for practical correctness. Expect a working understanding of how to implement or fix the thing, not deep architectural reasoning.",
  mid:
    "Grade for both correctness and reasoning. Expect the candidate to justify basic design choices, not just describe what they'd do.",
  senior:
    "Grade for depth and tradeoffs. A technically correct answer that shows no awareness of alternatives, failure modes, or scale should be capped on technical_depth and problem_solving.",
  lead:
    "Grade for depth, tradeoffs, AND the ability to reason about team or process impact where the question allows for it.",
  principal:
    "Grade for organization-wide thinking. A correct answer narrowly scoped to a single service or team, with no acknowledgement of broader system or organizational impact, should be capped on technical_depth.",
};

/** Truncate prompt-injected answers to keep token counts bounded. */
const MAX_ANSWER_CHARS_IN_PROMPT = 400;

/**
 * HARD CAP: maximum number of follow-up questions allowed on a single topic
 * before the engine forces a topic transition. Per spec, this is exactly 1 —
 * enforced in code, never left to prompt instruction alone.
 */
const MAX_FOLLOWUPS_PER_TOPIC = 1;

/**
 * Maximum number of CONSECUTIVE questions on the same topic before the engine
 * forces a new topic. This equals MAX_FOLLOWUPS_PER_TOPIC + 1 (the original
 * question + exactly one follow-up).
 */
const MAX_CONSECUTIVE_SAME_TOPIC = MAX_FOLLOWUPS_PER_TOPIC;

/**
 * Maximum number of total questions allowed on any single topic across the
 * WHOLE interview (not just consecutively) — a safety net for cases like a
 * weakness revisit later landing back on an already-covered topic.
 */
const MAX_QUESTIONS_PER_TOPIC = 3;

/**
 * Weakness revisit timing window: a weakness should not be revisited
 * immediately, and should not be forgotten either. The ideal window is
 * 2-4 unrelated questions after it was detected.
 */
const WEAKNESS_REVISIT_DELAY_MIN = 2;
const WEAKNESS_REVISIT_DELAY_MAX = 4;
/** Preserved for backward compatibility — equals the minimum delay. */
const WEAKNESS_REVISIT_DELAY = WEAKNESS_REVISIT_DELAY_MIN;

/**
 * Score thresholds that govern follow-up vs. new-topic strategy.
 * Keep these in one place so questionGenerator.js, evaluateAnswer.js, and
 * the prompts all reference the same values.
 */
const SCORE_THRESHOLDS = {
  /** Below this: always try one follow-up to probe the gap. */
  WEAK: 5,
  /** At or above this: move to a new topic — mastery is demonstrated. */
  STRONG: 8,
};

/**
 * Major technical coverage areas a senior interviewer is expected to probe
 * across a full-length interview. When any of these has not been touched at
 * all, it takes priority over drilling further into an already-covered topic
 * (e.g. another JWT follow-up) — this is what makes the interview feel
 * interviewer-like rather than tunnel-visioned on one subject.
 */
const PRIORITY_COVERAGE_AREAS = [
  "Authentication & Authorization",
  "Databases & Data Modeling",
  "Caching",
  "Node.js / Backend Runtime",
  "System Design & Scalability",
  "Security",
];

/**
 * How many of the most recent turns/evaluations are sent to the LLM in full
 * detail. Older turns are folded into a compressed summary instead — this is
 * what keeps prompt size bounded as the interview grows past 10-15 turns.
 */
const RECENT_TURNS_LIMIT = 5;
const RECENT_EVALS_LIMIT = 5;

/**
 * How many of the most recently asked topics are treated as "fresh in the
 * candidate's and interviewer's mind" for diversity-penalty purposes.
 */
const RECENT_TOPIC_WINDOW = 4;

/**
 * Interview phase boundaries (by question number, 1-indexed).
 *
 * Phase 1 → Resume Exploration            — breadth, warm-up, grounded in profile
 * Phase 2 → Core Technical Assessment      — fundamentals across multiple skills
 * Phase 3 → Deep Technical Assessment      — harder probes, tradeoffs, depth
 * Phase 4 → System Design & Scalability    — architecture, scale, failure modes
 * Phase 5 → Weakness Validation            — revisit gaps from a new angle
 * Phase 6 → Wrap-up Assessment             — close remaining gaps, final signal
 */
const PHASE_BOUNDARIES = [
  { phase: 1, label: "Resume Exploration", from: 1, to: 3 },
  { phase: 2, label: "Core Technical Assessment", from: 4, to: 7 },
  { phase: 3, label: "Deep Technical Assessment", from: 8, to: 11 },
  { phase: 4, label: "System Design & Scalability", from: 12, to: 14 },
  { phase: 5, label: "Weakness Validation", from: 15, to: 17 },
  { phase: 6, label: "Wrap-up Assessment", from: 18, to: Infinity },
];

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC TAG DERIVATION (v2 — concept-grouped taxonomy)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Topic taxonomy: each entry groups several related micro-topics under one
 * stable, broad label so the strategy engine treats them as "the same topic"
 * for breadth/depth purposes. This is the fix for the JWT / Refresh Tokens /
 * Token Rotation / Token Blacklisting problem — they all normalize to
 * "Authentication & Authorization" instead of fragmenting into near-duplicate
 * micro-topics that each look "new" to the old regex matcher.
 *
 * Still pure regex/substring matching — no NLP, no external dependencies —
 * just organized so related concepts collapse into one bucket.
 */
const TOPIC_TAXONOMY = [
  {
    label: "Authentication & Authorization",
    regex:
      /jwt|json web token|refresh token|token blacklist|token rotation|bearer token|oauth|sso\b|saml|openid connect|session management|\bsession\b|\bcookie|csrf|xsrf|authentication|authorization|access control|\brbac\b|permission(s)?/,
  },
  {
    label: "Databases & Data Modeling",
    regex:
      /\bsql\b|postgres|mysql|relational|query optim|index(ing)?|foreign key|\bjoin\b|\borm\b|mongo|dynamo|cassandra|nosql|document db|couch|schema design|data model(ing)?|normaliz/,
  },
  {
    label: "Caching",
    regex: /redis|memcach|cache invalidat|cach(e|ing)/,
  },
  {
    label: "Node.js / Backend Runtime",
    regex:
      /node\.?js|event loop|non.?blocking|libuv|express\b|nestjs|fastapi|django|spring boot|rails|backend framework/,
  },
  {
    label: "Containers & DevOps",
    regex:
      /docker|container|kubernetes|k8s|helm|\bpod\b|namespace|ci\/cd|pipeline|deploy(ment)?|release process|github action|jenkins/,
  },
  {
    label: "API Design",
    regex:
      /rest api|http method|endpoint|api design|openapi|swagger|graphql|grpc|websocket|real.?time|socket\.io|server.sent|\bsse\b|long.poll/,
  },
  {
    label: "System Design & Scalability",
    regex:
      /system design|scalab|load balanc|distributed|sharding|replication|consistency|microservice|service mesh|event.driven|event.sourcing|saga pattern|message queue|kafka|rabbitmq|\bsqs\b|pub.?sub/,
  },
  {
    label: "Security",
    regex:
      /security|\bxss\b|sql inject|vulnerab|encrypt|hash(ing)?|bcrypt|\btls\b|\bssl\b/,
  },
  {
    label: "Algorithms & Data Structures",
    regex:
      /algorithm|big.?o|complexity|data structure|linked list|binary tree|graph search|\bheap\b|\bsort(ing)?\b/,
  },
  {
    label: "Testing & Quality",
    regex: /test(ing)?|jest|vitest|unit test|\bmock\b|\bstub\b|\btdd\b|\bbdd\b|\be2e\b/,
  },
  {
    label: "Performance & Debugging",
    regex:
      /performance|latency|throughput|profil|flame graph|memory leak|bottleneck|debugging|troubleshoot|root cause|\btrace\b|log(ging)?/,
  },
  {
    label: "Frontend",
    regex:
      /react|vue|angular|svelte|next\.?js|nuxt|frontend|ui component|\bdom\b|browser rendering/,
  },
  {
    label: "Cloud & Infrastructure",
    regex: /\bcloud\b|\baws\b|\bgcp\b|\bazure\b|serverless|lambda|\bs3\b|\bec2\b|terraform/,
  },
  {
    label: "Version Control",
    regex: /\bgit\b|version control|\bbranch(ing)?\b|\bmerge\b|\brebase\b/,
  },
];

/**
 * Maps a question string + its declared type to a short, stable, GROUPED
 * topic tag (e.g. "Authentication & Authorization" rather than "JWT").
 *
 * @param {string} question
 * @param {string} questionType
 * @returns {string}
 */
function deriveTopicTag(question, questionType) {
  if (typeof question !== "string") return questionType || "General";
  const q = question.toLowerCase();

  for (const { regex, label } of TOPIC_TAXONOMY) {
    if (regex.test(q)) return label;
  }

  // Fall back to question type so behavioral/situational/hr still cluster.
  return questionType || "General";
}

// ─────────────────────────────────────────────────────────────────────────────
// SKIP DETECTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true when the candidate's answer is functionally empty or an explicit
 * "I don't know." Used to prevent the strategy engine from treating a skip as a
 * scored answer and erroneously following up on an unanswered topic.
 *
 * @param {string|undefined} answer
 * @returns {boolean}
 */
function isSkippedAnswer(answer) {
  if (!answer || typeof answer !== "string") return true;
  const normalized = answer.trim().toLowerCase();
  if (normalized.length === 0) return true;

  const SKIP_PHRASES = [
    "i don't know", "i dont know", "idk", "no idea", "not sure",
    "i have no idea", "i'm not sure", "i am not sure", "skip",
    "pass", "i don't know this", "i dont know this", "can't answer",
    "cannot answer", "i don't know the answer", "i have no clue",
    "no clue", "i'm unsure", "unsure", "next question", "i'll pass",
  ];

  if (SKIP_PHRASES.some((phrase) => normalized.includes(phrase))) return true;

  // Three words or fewer is functionally a skip for a technical interview.
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  return wordCount <= 3;
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEW PHASE (v2 — six phases)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the current interview phase object based on how many questions have
 * been asked so far (pass previousTurns.length directly).
 *
 * @param {number} questionCount  Number of turns completed so far (0 at start).
 * @returns {{ phase: number, label: string, from: number, to: number }}
 */
function getInterviewPhase(questionCount) {
  const nextQuestionNumber = (questionCount || 0) + 1;

  for (const boundary of PHASE_BOUNDARIES) {
    if (nextQuestionNumber >= boundary.from && nextQuestionNumber <= boundary.to) {
      return boundary;
    }
  }

  return PHASE_BOUNDARIES[PHASE_BOUNDARIES.length - 1];
}

// ─────────────────────────────────────────────────────────────────────────────
// TOPIC COVERAGE ANALYSIS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Counts how many questions have been asked per derived topic tag.
 *
 * @param {Array} previousTurns
 * @returns {Map<string, number>}  topic → count
 */
function buildTopicCountMap(previousTurns) {
  const counts = new Map();
  if (!Array.isArray(previousTurns)) return counts;

  for (const turn of previousTurns) {
    const tag = deriveTopicTag(turn.question, turn.questionType);
    counts.set(tag, (counts.get(tag) || 0) + 1);
  }

  return counts;
}

/**
 * Returns the topic with the highest question count, along with its count.
 *
 * @param {Array} previousTurns
 * @returns {{ topic: string, count: number } | null}
 */
function getMostCoveredTopic(previousTurns) {
  const counts = buildTopicCountMap(previousTurns);
  if (counts.size === 0) return null;

  let maxTopic = null;
  let maxCount = 0;

  for (const [topic, count] of counts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      maxTopic = topic;
    }
  }

  return maxTopic ? { topic: maxTopic, count: maxCount } : null;
}

/**
 * Returns the number of consecutive questions at the END of previousTurns
 * that share the same topic tag as the most recent question.
 *
 * Skipped answers break the streak — a skip means the topic was abandoned,
 * not followed up, so the streak resets.
 *
 * @param {Array} previousTurns
 * @returns {number}  0 = no streak, 1 = one follow-up already given, etc.
 */
function getConsecutiveTopicCount(previousTurns) {
  if (!Array.isArray(previousTurns) || previousTurns.length < 2) return 0;

  const tags = previousTurns.map((t) => deriveTopicTag(t.question, t.questionType));
  let streak = 0;

  for (let i = tags.length - 1; i >= 1; i--) {
    const answer = previousTurns[i]?.answer || "";
    if (isSkippedAnswer(answer)) break;

    if (tags[i] === tags[i - 1]) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Returns the topic tags of the most recent N turns, most-recent first.
 * Used for diversity scoring — penalizing topics that were just used even if
 * they are not technically "overused" by total count.
 *
 * @param {Array} previousTurns
 * @param {number} [windowSize]
 * @returns {string[]}
 */
function getRecentTopicTags(previousTurns, windowSize = RECENT_TOPIC_WINDOW) {
  if (!Array.isArray(previousTurns) || previousTurns.length === 0) return [];
  return previousTurns
    .slice(-windowSize)
    .map((t) => deriveTopicTag(t.question, t.questionType))
    .reverse();
}

// ─────────────────────────────────────────────────────────────────────────────
// WEAKNESS REVISIT ELIGIBILITY (v2 — 2-4 question window)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the list of weakness topics that are NOW eligible for a revisit,
 * ordered so that topics sitting inside the ideal 2-4 question window surface
 * before topics that have been waiting longer (those still get revisited
 * eventually — they are never dropped — but the ideal-window ones are
 * prioritized first, matching real interviewer pacing).
 *
 * A weakness is eligible when at least WEAKNESS_REVISIT_DELAY_MIN questions
 * have been asked on OTHER topics since it was last seen. It is NOT capped at
 * the max window — a weakness outside the ideal window remains eligible
 * rather than silently expiring, so weak areas are never simply forgotten.
 *
 * @param {Array} previousTurns
 * @param {Array} evaluations
 * @returns {string[]}  List of topic tags eligible for revisit, ideal-window first.
 */
function getEligibleWeaknessRevisits(previousTurns, evaluations) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) return [];
  if (!Array.isArray(previousTurns) || previousTurns.length === 0) return [];

  const weakTurnsByTag = new Map(); // tag → index of the MOST RECENT weak turn on that topic

  evaluations.forEach((evaluation) => {
    if (!evaluation?.turnId) return;
    if (typeof evaluation.score !== "number") return;
    if (evaluation.score >= SCORE_THRESHOLDS.WEAK) return; // only weak answers

    const turnIndex = previousTurns.findIndex(
      (t) => t._id?.toString() === evaluation.turnId.toString()
    );
    if (turnIndex === -1) return;

    const tag = deriveTopicTag(
      previousTurns[turnIndex].question,
      previousTurns[turnIndex].questionType
    );

    const existing = weakTurnsByTag.get(tag);
    if (existing === undefined || turnIndex > existing) {
      weakTurnsByTag.set(tag, turnIndex);
    }
  });

  if (weakTurnsByTag.size === 0) return [];

  const totalTurns = previousTurns.length;

  const eligible = [];

  for (const [tag, weakTurnIndex] of weakTurnsByTag.entries()) {
    const questionsSinceWeakness = totalTurns - 1 - weakTurnIndex;
    if (questionsSinceWeakness >= WEAKNESS_REVISIT_DELAY_MIN) {
      eligible.push({
        tag,
        questionsSinceWeakness,
        inIdealWindow: questionsSinceWeakness <= WEAKNESS_REVISIT_DELAY_MAX,
      });
    }
  }

  // Ideal-window topics first (closer to the 2-4 sweet spot), then overdue
  // topics ordered by how long they've been waiting (longest first, so
  // nothing gets perpetually starved).
  eligible.sort((a, b) => {
    if (a.inIdealWindow !== b.inIdealWindow) return a.inIdealWindow ? -1 : 1;
    return b.questionsSinceWeakness - a.questionsSinceWeakness;
  });

  return eligible.map((e) => e.tag);
}

// ─────────────────────────────────────────────────────────────────────────────
// COVERAGE TARGET SELECTION (v2 — phase-aware, priority-area-aware, diversity-aware)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the highest-priority uncovered area for the next new-topic question.
 *
 * Priority order:
 *  - Phase 4 (System Design & Scalability): force system design coverage
 *    unless it has already been asked twice.
 *  - Phase 5 (Weakness Validation): prefer an eligible weakness revisit.
 *  - Outside phase 1: uncovered PRIORITY_COVERAGE_AREAS (MongoDB/Redis/
 *    Node.js/System Design/Security-class major areas) take priority over
 *    drilling further into an already-covered micro-topic.
 *  - Uncovered resume skills
 *  - Uncovered projects
 *  - Uncovered experience areas
 *  - Uncovered job-description requirements
 *  - Eligible weakness revisits
 *  - System design / architecture (catch-all)
 *
 * @param {Object} memory  The interviewer memory object from buildInterviewerMemory().
 * @returns {{ type: string, value: string }}
 */
function selectNextCoverageTarget(memory) {
  if (!memory) {
    return { type: "system_design", value: "System Design & Scalability" };
  }

  const phase = memory.interviewPhase?.phase || 2;

  // Phase 4: system design & scalability is the explicit mandate of this phase.
  if (phase === 4) {
    const sdCount = memory.topicCountMap?.get("System Design & Scalability") || 0;
    if (sdCount < 2) {
      return { type: "system_design", value: "System Design & Scalability" };
    }
  }

  // Phase 5: weakness validation is the explicit mandate of this phase.
  if (phase === 5 && memory.eligibleWeaknessRevisits?.length > 0) {
    return { type: "weakness_revisit", value: memory.eligibleWeaknessRevisits[0] };
  }

  // Outside the resume-breadth phase, prioritize untouched major technical
  // domains over yet another resume-skill micro-question.
  if (phase !== 1 && memory.uncoveredPriorityAreas?.length > 0) {
    return { type: "priority_area", value: memory.uncoveredPriorityAreas[0] };
  }

  if (memory.uncoveredSkills?.length > 0) {
    return { type: "skill", value: memory.uncoveredSkills[0] };
  }

  if (memory.uncoveredProjects?.length > 0) {
    return { type: "project", value: memory.uncoveredProjects[0] };
  }

  if (memory.uncoveredExperience?.length > 0) {
    return { type: "experience", value: memory.uncoveredExperience[0] };
  }

  if (memory.uncoveredJDRequirements?.length > 0) {
    return { type: "jd_requirement", value: memory.uncoveredJDRequirements[0] };
  }

  if (memory.eligibleWeaknessRevisits?.length > 0) {
    return { type: "weakness_revisit", value: memory.eligibleWeaknessRevisits[0] };
  }

  // Catch-all — prefer a priority area even if "covered" but low count, over
  // a flat default, so the engine still tries to deepen real coverage gaps.
  if (memory.uncoveredPriorityAreas?.length > 0) {
    return { type: "priority_area", value: memory.uncoveredPriorityAreas[0] };
  }

  return { type: "system_design", value: "System Design & Scalability" };
}

// ─────────────────────────────────────────────────────────────────────────────
// INTERVIEWER MEMORY
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a snapshot of everything the strategy engine needs to know about
 * the current interview state. This is an in-memory object constructed fresh
 * on every call — no database changes required.
 *
 * @param {Array} previousTurns
 * @param {Array} evaluations
 * @param {Object} candidateProfile
 * @param {string} [jobDescription]
 * @returns {Object}  Full interviewer memory object.
 */
function buildInterviewerMemory(previousTurns, evaluations, candidateProfile, jobDescription) {
  const safeTurns = Array.isArray(previousTurns) ? previousTurns : [];
  const safeEvals = Array.isArray(evaluations) ? evaluations : [];

  // ── Topic counts ──────────────────────────────────────────────────────────
  const topicCountMap = buildTopicCountMap(safeTurns);

  const overusedTopics = Array.from(topicCountMap.entries())
    .filter(([, count]) => count >= MAX_QUESTIONS_PER_TOPIC)
    .map(([topic]) => topic);

  const coveredTopics = Array.from(topicCountMap.keys());

  // ── Diversity: recently used topics, for penalizing repeats ───────────────
  const recentTopicTags = getRecentTopicTags(safeTurns, RECENT_TOPIC_WINDOW);

  // ── Major-area coverage (Problem 3) ────────────────────────────────────────
  const uncoveredPriorityAreas = PRIORITY_COVERAGE_AREAS.filter(
    (area) => (topicCountMap.get(area) || 0) === 0
  );

  // ── Skill / project / experience coverage ─────────────────────────────────
  const coveredText = safeTurns.map((t) => (t.question || "").toLowerCase()).join(" ");

  const profileSkills = Array.isArray(candidateProfile?.skills) ? candidateProfile.skills : [];
  const uncoveredSkills = profileSkills.filter(
    (skill) => !coveredText.includes((skill || "").toLowerCase())
  );

  const profileProjects = Array.isArray(candidateProfile?.projects) ? candidateProfile.projects : [];
  const uncoveredProjects = profileProjects
    .filter((p) => {
      const title = (p?.title || "").toLowerCase();
      return title && !coveredText.includes(title);
    })
    .map((p) => p.title);

  const profileExperience = Array.isArray(candidateProfile?.experience) ? candidateProfile.experience : [];
  const uncoveredExperience = profileExperience
    .filter((e) => {
      const role = (e?.role || "").toLowerCase();
      const company = (e?.company || "").toLowerCase();
      return (role || company) && !coveredText.includes(role) && !coveredText.includes(company);
    })
    .map((e) => `${e.role || "Role"} at ${e.company || "Company"}`);

  // ── JD requirement extraction (lightweight keyword heuristic) ─────────────
  const uncoveredJDRequirements = extractUncoveredJDRequirements(jobDescription, coveredText);

  // ── Weakness tracking ─────────────────────────────────────────────────────
  const recurringWeaknesses = extractWeaknessPatterns(safeEvals);
  const eligibleWeaknessRevisits = getEligibleWeaknessRevisits(safeTurns, safeEvals);

  // ── Streak and phase ──────────────────────────────────────────────────────
  const consecutiveTopicCount = getConsecutiveTopicCount(safeTurns);
  const interviewPhase = getInterviewPhase(safeTurns.length);

  // ── Most recent turn ──────────────────────────────────────────────────────
  const lastTurn = safeTurns[safeTurns.length - 1] || null;
  const lastTurnTag = lastTurn
    ? deriveTopicTag(lastTurn.question, lastTurn.questionType)
    : null;
  const lastAnswerSkipped = lastTurn ? isSkippedAnswer(lastTurn.answer) : false;

  // ── Scores: last 3 (Problem 9 — trend/consistency-aware difficulty) ───────
  const allScores = safeEvals.map((e) => e?.score).filter((s) => typeof s === "number");
  const lastScore = allScores.length > 0 ? allScores[allScores.length - 1] : null;
  const last3Scores = allScores.slice(-3);
  const recentScores = allScores.slice(-2); // preserved for existing Rule 4 compatibility

  return {
    // Coverage
    coveredTopics,
    overusedTopics,
    topicCountMap,
    uncoveredSkills,
    uncoveredProjects,
    uncoveredExperience,
    uncoveredJDRequirements,
    uncoveredPriorityAreas,

    // Diversity
    recentTopicTags,

    // Weakness tracking
    recurringWeaknesses,
    eligibleWeaknessRevisits,

    // Current state
    consecutiveTopicCount,
    interviewPhase,
    lastTurnTag,
    lastAnswerSkipped,
    lastScore,
    recentScores,
    last3Scores,

    // Convenience flags
    hasOverusedTopics: overusedTopics.length > 0,
    allSkillsCovered: uncoveredSkills.length === 0,
    isInPhase4: interviewPhase.phase === 4,
  };
}

/**
 * Extracts likely technical requirements from a job description string that
 * haven't appeared in the covered text yet. Pure heuristic — no NLP.
 *
 * @param {string|undefined} jobDescription
 * @param {string} coveredText
 * @returns {string[]}
 */
function extractUncoveredJDRequirements(jobDescription, coveredText) {
  if (!jobDescription || typeof jobDescription !== "string") return [];

  const JD_TECH_PATTERNS = [
    /\b(React|Vue|Angular|Next\.js|Svelte)\b/gi,
    /\b(Node\.js|Express|NestJS|FastAPI|Django|Spring Boot|Rails)\b/gi,
    /\b(PostgreSQL|MySQL|MongoDB|DynamoDB|Cassandra|Redis)\b/gi,
    /\b(Docker|Kubernetes|AWS|GCP|Azure|Terraform)\b/gi,
    /\b(Kafka|RabbitMQ|SQS|Pub\/Sub)\b/gi,
    /\b(GraphQL|REST|gRPC|WebSocket)\b/gi,
    /\b(TypeScript|Go|Rust|Java|Python|Kotlin|Swift)\b/gi,
    /\b(CI\/CD|GitHub Actions|Jenkins|CircleCI)\b/gi,
    /\b(system design|distributed systems|microservices|scalability)\b/gi,
  ];

  const found = new Set();
  for (const pattern of JD_TECH_PATTERNS) {
    const matches = jobDescription.match(pattern) || [];
    for (const match of matches) {
      found.add(match.trim());
    }
  }

  return Array.from(found).filter(
    (req) => !coveredText.includes(req.toLowerCase())
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DETERMINISTIC STRATEGY ENGINE (v2 — hard 1-follow-up cap, priority-area override)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Determines whether the next question should be a follow-up on the current
 * topic or a move to a new topic. THE LLM DOES NOT MAKE THIS DECISION.
 *
 * Decision tree (evaluated in order — first matching rule wins):
 *
 *  FORCE NEW TOPIC:
 *   1. Last answer was skipped.
 *   2. Consecutive same-topic count >= MAX_CONSECUTIVE_SAME_TOPIC (= 1) —
 *      i.e. one follow-up has already been used on this topic. HARD CAP,
 *      no exceptions, never relies on the prompt to enforce this.
 *   3. Current topic is overused (total count >= MAX_QUESTIONS_PER_TOPIC).
 *   4. Last 2 scores both >= STRONG → mastery demonstrated, move on.
 *   5. A major coverage area (PRIORITY_COVERAGE_AREAS) has never been
 *      touched and we are past the resume-exploration phase → breadth over
 *      another follow-up, even if the follow-up would otherwise be eligible.
 *   6. Phase 1 breadth enforcement: switch after 2 questions on same area.
 *
 *  FOLLOW_UP (capped at exactly one — Rules 7 & 8 both additionally require
 *  consecutiveTopicCount === 0, i.e. no follow-up has happened yet):
 *   7. Last score < WEAK → one probe follow-up is warranted.
 *   8. Last score in [WEAK, STRONG) with evaluator-identified gaps → one
 *      optional follow-up.
 *
 *  DEFAULT NEW TOPIC:
 *   9. No strong follow-up signal → new topic.
 *
 * @param {Object} memory  From buildInterviewerMemory().
 * @param {Array} evaluations
 * @returns {{ strategy: "follow_up" | "new_topic", reason: string }}
 */
function determineQuestionStrategy(memory, evaluations) {
  if (!memory) {
    return { strategy: "new_topic", reason: "No memory object — defaulting to new topic." };
  }

  // ── Rule 1: Skipped answer ────────────────────────────────────────────────
  if (memory.lastAnswerSkipped) {
    return {
      strategy: "new_topic",
      reason: "Last answer was skipped or empty — moving to a new topic to preserve interview quality.",
    };
  }

  // ── Rule 2: Hard cap — max 1 follow-up per topic ──────────────────────────
  if (memory.consecutiveTopicCount >= MAX_CONSECUTIVE_SAME_TOPIC) {
    return {
      strategy: "new_topic",
      reason: `Maximum follow-ups (${MAX_FOLLOWUPS_PER_TOPIC}) on "${memory.lastTurnTag}" already used — hard cap forces topic transition.`,
    };
  }

  // ── Rule 3: Topic is overused (total count threshold) ─────────────────────
  if (memory.lastTurnTag && memory.overusedTopics.includes(memory.lastTurnTag)) {
    return {
      strategy: "new_topic",
      reason: `"${memory.lastTurnTag}" has been asked ${memory.topicCountMap?.get(memory.lastTurnTag) ?? "multiple"} times — topic overuse limit reached.`,
    };
  }

  // ── Rule 4: Strong recent performance ────────────────────────────────────
  const bothRecentStrong =
    memory.recentScores.length >= 2 &&
    memory.recentScores.every((s) => s >= SCORE_THRESHOLDS.STRONG);
  if (bothRecentStrong) {
    return {
      strategy: "new_topic",
      reason: `Recent scores (${memory.recentScores.join(", ")}) indicate mastery — moving on.`,
    };
  }

  // ── Rule 5: Untouched major coverage area takes priority ──────────────────
  if (
    memory.interviewPhase?.phase > 1 &&
    memory.uncoveredPriorityAreas?.length > 0
  ) {
    return {
      strategy: "new_topic",
      reason: `Major coverage area(s) untouched (${memory.uncoveredPriorityAreas.join(", ")}) — breadth takes priority over another follow-up.`,
    };
  }

  // ── Rule 6: Phase 1 breadth enforcement ──────────────────────────────────
  if (
    memory.interviewPhase?.phase === 1 &&
    memory.lastTurnTag &&
    (memory.topicCountMap?.get(memory.lastTurnTag) || 0) >= 2
  ) {
    return {
      strategy: "new_topic",
      reason: "Phase 1 (Resume Exploration) requires breadth — switching topics after 2 questions on same area.",
    };
  }

  // ── Rule 7: Weak last answer → one follow-up (only if none used yet) ─────
  if (
    memory.lastScore !== null &&
    memory.lastScore < SCORE_THRESHOLDS.WEAK &&
    !memory.lastAnswerSkipped &&
    memory.consecutiveTopicCount < MAX_FOLLOWUPS_PER_TOPIC
  ) {
    return {
      strategy: "follow_up",
      reason: `Last score was ${memory.lastScore} (below ${SCORE_THRESHOLDS.WEAK}) — probing the gap with the one allowed follow-up.`,
    };
  }

  // ── Rule 8: Optional follow-up for mid-range scores (only if none used yet) ──
  const safeEvals = Array.isArray(evaluations) ? evaluations : [];
  const lastEval = safeEvals[safeEvals.length - 1];
  const hasRecommendedTopics =
    Array.isArray(lastEval?.recommendedFollowUpTopics) &&
    lastEval.recommendedFollowUpTopics.length > 0;

  if (
    memory.lastScore !== null &&
    memory.lastScore >= SCORE_THRESHOLDS.WEAK &&
    memory.lastScore < SCORE_THRESHOLDS.STRONG &&
    hasRecommendedTopics &&
    memory.consecutiveTopicCount < MAX_FOLLOWUPS_PER_TOPIC
  ) {
    return {
      strategy: "follow_up",
      reason: `Score ${memory.lastScore} with identified gaps — using the one allowed follow-up on: ${lastEval.recommendedFollowUpTopics.join(", ")}.`,
    };
  }

  // ── Rule 9: Default → new topic ──────────────────────────────────────────
  return {
    strategy: "new_topic",
    reason: "No strong follow-up signal — moving to a new topic to maximize coverage.",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WEAKNESS PATTERN DETECTION (existing, preserved)
// ─────────────────────────────────────────────────────────────────────────────

const WEAKNESS_KEYWORDS = [
  "jwt", "oauth", "authentication", "authorization", "session management",
  "database indexing", "indexing", "caching", "cache invalidation",
  "scalability", "concurrency", "race condition", "api design", "rest api",
  "graphql", "testing", "error handling", "security", "performance",
  "system design", "data structures", "algorithms", "sql", "nosql",
  "microservices", "load balancing", "rate limiting", "websocket",
  "docker", "kubernetes",
];

/**
 * Scans evaluation feedback for recurring weak topics using simple keyword
 * matching. Only low-scoring evaluations (< 6) are considered. A keyword must
 * appear in at least 2 separate low-scoring evaluations to be flagged.
 *
 * @param {Array} evaluations
 * @returns {string[]}
 */
function extractWeaknessPatterns(evaluations) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) return [];

  const keywordCounts = new Map();

  for (const evaluation of evaluations) {
    if (!evaluation?.feedback) continue;
    if (typeof evaluation.score === "number" && evaluation.score >= 6) continue;

    const feedbackLower = evaluation.feedback.toLowerCase();
    for (const keyword of WEAKNESS_KEYWORDS) {
      if (feedbackLower.includes(keyword)) {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      }
    }
  }

  return Array.from(keywordCounts.entries())
    .filter(([, count]) => count >= 2)
    .map(([keyword]) => keyword);
}

// ─────────────────────────────────────────────────────────────────────────────
// FOLLOW-UP TOPIC EXTRACTION (existing, preserved)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Collects all recommendedFollowUpTopics across evaluations and de-duplicates.
 * Capped to the most recent 3 evaluations to avoid surfacing stale suggestions
 * from early in the interview.
 *
 * @param {Array} evaluations
 * @returns {string[]}
 */
function extractFollowUpTopics(evaluations) {
  if (!Array.isArray(evaluations)) return [];

  const recentEvals = evaluations.slice(-3);
  const topics = [];

  for (const evaluation of recentEvals) {
    if (Array.isArray(evaluation?.recommendedFollowUpTopics)) {
      topics.push(...evaluation.recommendedFollowUpTopics);
    }
  }

  return [...new Set(topics)];
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPRESSED HISTORY SUMMARY (Problem 6 — bounded prompt size)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a short, compressed summary of everything BEFORE the most recent
 * RECENT_TURNS_LIMIT turns, so the model gets situational awareness of the
 * whole interview without receiving every turn's full text. Combined with
 * formatInterviewHistory / formatEvaluationHistory (which only render the
 * most recent window), this keeps prompt size roughly constant regardless of
 * how long the interview runs.
 *
 * @param {Array} previousTurns
 * @param {Array} evaluations
 * @returns {string}
 */
function buildCompressedHistorySummary(previousTurns, evaluations) {
  if (!Array.isArray(previousTurns) || previousTurns.length <= RECENT_TURNS_LIMIT) {
    return "";
  }

  const olderTurns = previousTurns.slice(0, previousTurns.length - RECENT_TURNS_LIMIT);
  if (olderTurns.length === 0) return "";

  const topicCounts = buildTopicCountMap(olderTurns);
  const topicSummary = Array.from(topicCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => `${topic} (${count})`)
    .join(", ");

  const olderTurnIds = new Set(olderTurns.map((t) => t._id?.toString()).filter(Boolean));
  const olderEvals = Array.isArray(evaluations)
    ? evaluations.filter((e) => e?.turnId && olderTurnIds.has(e.turnId.toString()))
    : [];
  const olderScores = olderEvals.map((e) => e.score).filter((s) => typeof s === "number");
  const avgOlderScore =
    olderScores.length > 0
      ? (olderScores.reduce((a, b) => a + b, 0) / olderScores.length).toFixed(1)
      : null;

  const recurring = extractWeaknessPatterns(olderEvals);

  const lines = [
    `SUMMARY OF EARLIER INTERVIEW (questions 1-${olderTurns.length}, condensed — full detail omitted to keep this prompt focused):`,
    `  Topics covered: ${topicSummary || "none"}`,
    avgOlderScore !== null ? `  Average score in this span: ${avgOlderScore}/10` : null,
    recurring.length > 0 ? `  Recurring weak areas noted: ${recurring.join(", ")}` : null,
  ].filter(Boolean);

  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────────────────────
// PROMPT FORMATTING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatExperience(experience) {
  if (!Array.isArray(experience) || experience.length === 0) {
    return "Experience: Not specified";
  }
  const lines = experience.map((exp) => {
    const role = exp?.role || "Unknown role";
    const company = exp?.company || "Unknown company";
    const duration = exp?.duration ? ` (${exp.duration})` : "";
    const description = exp?.description ? ` — ${exp.description}` : "";
    return `- ${role} at ${company}${duration}${description}`;
  });
  return `Experience:\n${lines.join("\n")}`;
}

function formatProjects(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return "Projects: Not specified";
  }
  const lines = projects.map((project) => {
    const title = project?.title || "Untitled project";
    const description = project?.description ? ` — ${project.description}` : "";
    const techStack =
      Array.isArray(project?.techStack) && project.techStack.length > 0
        ? ` [Tech: ${project.techStack.join(", ")}]`
        : "";
    return `- ${title}${description}${techStack}`;
  });
  return `Projects:\n${lines.join("\n")}`;
}

function formatSeniorityGuidance(experienceLevel) {
  const guidance = SENIORITY_GUIDANCE[experienceLevel] || SENIORITY_GUIDANCE.mid;
  return `SENIORITY CALIBRATION (${experienceLevel || "mid"})\n${guidance}`;
}

/**
 * Renders the most recent RECENT_TURNS_LIMIT turns as Q/A pairs, numbered by
 * their REAL position in the interview (not re-numbered from 1) so the model
 * isn't confused when a compressed summary precedes this block.
 *
 * @param {Array} previousTurns
 * @returns {string}
 */
function formatInterviewHistory(previousTurns) {
  if (!Array.isArray(previousTurns) || previousTurns.length === 0) {
    return "No questions asked yet.";
  }

  const total = previousTurns.length;
  const startIndex = Math.max(0, total - RECENT_TURNS_LIMIT);
  const recentTurns = previousTurns.slice(startIndex);

  return recentTurns
    .map((turn, i) => {
      const realIndex = startIndex + i + 1;
      const answer = turn.answer
        ? truncate(turn.answer, MAX_ANSWER_CHARS_IN_PROMPT)
        : "(not yet answered)";
      return `Q${realIndex} (${turn.questionType}): ${turn.question}\nA${realIndex}: ${answer}`;
    })
    .join("\n\n");
}

/**
 * Renders evaluations for the most recent RECENT_EVALS_LIMIT turns only.
 *
 * @param {Array} previousTurns
 * @param {Array} evaluations
 * @returns {string}
 */
function formatEvaluationHistory(previousTurns, evaluations) {
  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    return "No evaluations yet.";
  }
  if (!Array.isArray(previousTurns) || previousTurns.length === 0) {
    return "No evaluations yet.";
  }

  const total = previousTurns.length;
  const startIndex = Math.max(0, total - RECENT_TURNS_LIMIT);
  const recentTurns = previousTurns.slice(startIndex);

  const evaluationByTurnId = new Map(
    evaluations
      .filter((evaluation) => evaluation?.turnId)
      .map((evaluation) => [evaluation.turnId.toString(), evaluation])
  );

  const blocks = recentTurns
    .map((turn, i) => {
      const realIndex = startIndex + i + 1;
      const evaluation = evaluationByTurnId.get(turn._id?.toString());
      if (!evaluation) return null;
      const feedback = truncate(evaluation.feedback || "", MAX_ANSWER_CHARS_IN_PROMPT);
      return `Question ${realIndex} Evaluation\n\nScore:\n${evaluation.score}/10\n\nFeedback:\n${feedback}`;
    })
    .filter(Boolean);

  return blocks.length > 0 ? blocks.join("\n\n") : "No evaluations yet.";
}

function formatList(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return "Not specified";
  return arr.join(", ");
}

/**
 * Builds a human-readable topic coverage summary for the prompt. Uses ALL
 * turns for accurate counts (this is aggregated statistics, not raw text, so
 * it stays compact even on a long interview) and includes the diversity
 * window so the model knows which topics were JUST used.
 *
 * @param {Array} previousTurns
 * @param {Array} evaluations
 * @param {Object} candidateProfile
 * @returns {string}
 */
function buildTopicCoverageContext(previousTurns, evaluations, candidateProfile) {
  if (!Array.isArray(previousTurns) || previousTurns.length === 0) {
    return "No questions asked yet — all topics are open.";
  }

  const topicCountMap = buildTopicCountMap(previousTurns);
  const consecutiveCount = getConsecutiveTopicCount(previousTurns);
  const recentTopicTags = getRecentTopicTags(previousTurns, RECENT_TOPIC_WINDOW);

  const coveredText = previousTurns.map((t) => t.question.toLowerCase()).join(" ");
  const profileSkills = Array.isArray(candidateProfile?.skills) ? candidateProfile.skills : [];
  const uncoveredSkills = profileSkills.filter(
    (skill) => !coveredText.includes((skill || "").toLowerCase())
  );

  const uncoveredPriorityAreas = PRIORITY_COVERAGE_AREAS.filter(
    (area) => (topicCountMap.get(area) || 0) === 0
  );

  const recentEvals = Array.isArray(evaluations) ? evaluations.slice(-3) : [];
  const recentRecommended = extractFollowUpTopics(recentEvals);

  const coverageLines = Array.from(topicCountMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([topic, count]) => `  ${topic}: ${count} question${count > 1 ? "s" : ""}`)
    .join("\n");

  const streakWarning =
    consecutiveCount >= MAX_CONSECUTIVE_SAME_TOPIC
      ? `⚠️  BREADTH REQUIRED: the one allowed follow-up on this topic has already been used. Strategy engine has forced a new topic.`
      : "No follow-up used yet on the current topic.";

  const lines = [
    "TOPIC COVERAGE SO FAR",
    coverageLines || "  (none yet)",
    "",
    `CONSECUTIVE SAME-TOPIC COUNT: ${consecutiveCount} (hard cap: ${MAX_FOLLOWUPS_PER_TOPIC} follow-up)`,
    streakWarning,
    "",
    uncoveredPriorityAreas.length > 0
      ? `MAJOR AREAS NOT YET EXPLORED (high priority — cover before more depth elsewhere):\n${uncoveredPriorityAreas.map((a) => `  - ${a}`).join("\n")}`
      : "All major technical areas have been touched at least once.",
    "",
    recentTopicTags.length > 0
      ? `RECENTLY USED TOPICS (avoid repeating for diversity, most recent first): ${recentTopicTags.join(", ")}`
      : "No recently used topics yet.",
    "",
    uncoveredSkills.length > 0
      ? `UNCOVERED RESUME SKILLS:\n${uncoveredSkills.map((s) => `  - ${s}`).join("\n")}`
      : "All resume skills have been touched at least once.",
    "",
    recentRecommended.length > 0
      ? `RECENTLY SUGGESTED FOLLOW-UP TOPICS (last 3 evaluations):\n${recentRecommended.map((t) => `  - ${t}`).join("\n")}`
      : "No recent follow-up topics suggested.",
  ];

  return lines.join("\n");
}

function truncate(text, maxLength) {
  if (typeof text !== "string") return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export {
  // ── Existing exports (unchanged signatures, preserved for backward compatibility) ──
  SENIORITY_GUIDANCE,
  formatExperience,
  formatProjects,
  formatSeniorityGuidance,
  formatInterviewHistory,
  formatEvaluationHistory,
  formatList,
  extractFollowUpTopics,
  buildTopicCoverageContext,
  truncate,
  deriveTopicTag,
  isSkippedAnswer,
  getInterviewPhase,
  getMostCoveredTopic,
  getConsecutiveTopicCount,
  getEligibleWeaknessRevisits,
  selectNextCoverageTarget,
  buildInterviewerMemory,
  determineQuestionStrategy,
  extractWeaknessPatterns,

  // ── Constants (existing) ──
  SCORE_THRESHOLDS,
  MAX_CONSECUTIVE_SAME_TOPIC,
  MAX_QUESTIONS_PER_TOPIC,
  WEAKNESS_REVISIT_DELAY,
  WEAKNESS_KEYWORDS,

  // ── New exports (v3) ──
  buildCompressedHistorySummary,
  getRecentTopicTags,
  PRIORITY_COVERAGE_AREAS,
  WEAKNESS_REVISIT_DELAY_MIN,
  WEAKNESS_REVISIT_DELAY_MAX,
  MAX_FOLLOWUPS_PER_TOPIC,
  RECENT_TURNS_LIMIT,
  RECENT_EVALS_LIMIT,
};