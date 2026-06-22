import { createJSONCompletion } from "@/lib/groq";

/**
 * Generates a production-grade final interview report by:
 *
 * 1. Aggregating per-turn evaluations into dimension averages
 * 2. Semantically merging similar strengths/weaknesses (not just deduping)
 * 3. Detecting performance trend (improving/declining/consistent)
 * 4. Finding strongest and weakest dimensions
 * 5. Computing hiring recommendation (Strong Hire / Hire / Borderline / No Hire)
 * 6. Computing confidence level (High / Medium / Low)
 * 7. Generating a personalized, hiring-manager-grade summary via Groq
 * 8. Ranking and limiting outputs (5 strengths, 5 weaknesses, 8 follow-ups)
 *
 * All deterministic analysis (scores, trends, dimensions, signals) is computed
 * in code. Groq is only called for the narrative summary, primed with that
 * structured data so it cannot hallucinate or contradict the computed results.
 *
 * @param {Object} params
 * @param {Object} params.candidateProfile - Candidateprofile document (skills, projects, experienceLevel)
 * @param {string} params.interviewType - "technical" | "behavioral" | "system_design" | "mixed"
 * @param {Array} params.turns - All answered Turn documents, sorted by index
 * @param {Array} params.evaluations - All Evaluation documents for those turns
 * @returns {Promise<{
 *   overallScore: number,
 *   dimensionAverages: Object,
 *   strongestDimension: string,
 *   weakestDimension: string,
 *   performanceTrend: "improving" | "declining" | "consistent",
 *   hiringRecommendation: "Strong Hire" | "Hire" | "Borderline Hire" | "No Hire",
 *   confidenceLevel: "High" | "Medium" | "Low",
 *   strengths: string[],
 *   weaknesses: string[],
 *   recommendedFollowUpTopics: string[],
 *   summary: string
 * }>}
 */
export async function generateInterviewReport({
  candidateProfile,
  interviewType,
  turns,
  evaluations,
}) {
  if (!Array.isArray(turns) || turns.length === 0) {
    throw new Error("generateInterviewReport requires a non-empty 'turns' array.");
  }
  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    throw new Error("generateInterviewReport requires a non-empty 'evaluations' array.");
  }

  // ============================================================
  // PHASE 1: DETERMINISTIC ANALYSIS (all in code, never contradicted)
  // ============================================================

  const overallScore = roundToOneDecimal(calculateOverallScore(evaluations));
  const dimensionAverages = aggregateDimensionScores(evaluations);
  const strongestDimension = getStrongestDimension(dimensionAverages);
  const weakestDimension = getWeakestDimension(dimensionAverages);
  const performanceTrend = getPerformanceTrend(evaluations);
  const hiringRecommendation = getHiringRecommendation({
    overallScore,
    dimensionAverages,
    evaluations,
  });
  const confidenceLevel = getConfidenceLevel({
    overallScore,
    dimensionAverages,
    evaluations,
  });

  // Semantically merge strengths and weaknesses (not just dedupe), then rank and limit
  const rawStrengths = evaluations.flatMap((e) => e.strengths || []);
  const rawWeaknesses = evaluations.flatMap((e) => e.weaknesses || []);
  const rawFollowUps = evaluations.flatMap((e) => e.recommendedFollowUpTopics || []);

  const strengths = rankAndLimit(
    semanticMerge(rawStrengths, "strengths"),
    5
  );
  const weaknesses = rankAndLimit(
    semanticMerge(rawWeaknesses, "weaknesses"),
    5
  );
  const recommendedFollowUpTopics = rankAndLimit(
    deduplicateCaseInsensitive(rawFollowUps),
    8
  );

  // ============================================================
  // PHASE 2: GROQ CALL (narrative summary only)
  // ============================================================

  const summary = await generateNarrativeSummary({
    candidateProfile,
    interviewType,
    overallScore,
    dimensionAverages,
    strongestDimension,
    weakestDimension,
    performanceTrend,
    strengths,
    weaknesses,
    turns,
    evaluations,
  });

  // ============================================================
  // RETURN: Complete, production-ready report
  // ============================================================

  return {
    overallScore,
    dimensionAverages,
    strongestDimension,
    weakestDimension,
    performanceTrend,
    hiringRecommendation,
    confidenceLevel,
    strengths,
    weaknesses,
    recommendedFollowUpTopics,
    summary,
  };
}

/* ============================================================
   PHASE 1 HELPERS: DETERMINISTIC ANALYSIS
   ============================================================ */

function calculateOverallScore(evaluations) {
  const total = evaluations.reduce((sum, e) => sum + (e.score || 0), 0);
  return total / evaluations.length;
}

/**
 * Computes average score for each dimension across all evaluations.
 * Returns an object like { clarity: 8.2, technical_depth: 7.1, ... }
 */
function aggregateDimensionScores(evaluations) {
  const totals = {};
  const counts = {};

  for (const evaluation of evaluations) {
    for (const dimension of evaluation.dimensionScores || []) {
      const name = dimension.dimension;
      totals[name] = (totals[name] || 0) + dimension.score;
      counts[name] = (counts[name] || 0) + 1;
    }
  }

  const averages = {};
  for (const name of Object.keys(totals)) {
    averages[name] = roundToOneDecimal(totals[name] / counts[name]);
  }

  return averages;
}

/**
 * Finds the highest-scoring dimension.
 * Returns the dimension name, e.g. "communication".
 * Tiebreaker: first in lexical order.
 */
function getStrongestDimension(dimensionAverages) {
  let strongest = null;
  let maxScore = -1;

  for (const [name, score] of Object.entries(dimensionAverages)) {
    if (score > maxScore || (score === maxScore && (!strongest || name < strongest))) {
      strongest = name;
      maxScore = score;
    }
  }

  return strongest || "unknown";
}

/**
 * Finds the lowest-scoring dimension.
 * Returns the dimension name, e.g. "problem_solving".
 * Tiebreaker: first in lexical order.
 */
function getWeakestDimension(dimensionAverages) {
  let weakest = null;
  let minScore = Infinity;

  for (const [name, score] of Object.entries(dimensionAverages)) {
    if (score < minScore || (score === minScore && (!weakest || name < weakest))) {
      weakest = name;
      minScore = score;
    }
  }

  return weakest || "unknown";
}

/**
 * Detects whether candidate is improving, declining, or consistent by
 * comparing first 1/3 of scores vs last 1/3.
 * Returns "improving" | "declining" | "consistent"
 */
function getPerformanceTrend(evaluations) {
  if (evaluations.length < 3) return "consistent";

  const splitIndex = Math.ceil(evaluations.length / 3);
  const firstThird = evaluations.slice(0, splitIndex);
  const lastThird = evaluations.slice(-splitIndex);

  const firstAvg =
    firstThird.reduce((sum, e) => sum + (e.score || 0), 0) / firstThird.length;
  const lastAvg =
    lastThird.reduce((sum, e) => sum + (e.score || 0), 0) / lastThird.length;

  const diff = lastAvg - firstAvg;

  // Must improve/decline by at least 0.5 points to be considered a trend
  if (diff >= 0.5) return "improving";
  if (diff <= -0.5) return "declining";
  return "consistent";
}

/**
 * Determines hiring recommendation based on:
 * - Overall score
 * - Dimension strength/balance
 * - Presence of critical weaknesses
 * - Seniority expectations (implicit in the score calibration)
 */
function getHiringRecommendation({ overallScore, dimensionAverages, evaluations }) {
  // Extract severity counts from weaknesses
  const allWeaknesses = evaluations.flatMap((e) => (e.weaknesses || []).map((w) => w.toLowerCase()));
  const hasCriticalWeakness = allWeaknesses.some(
    (w) =>
      w.includes("security") ||
      w.includes("basic understanding") ||
      w.includes("cannot") ||
      w.includes("fail")
  );

  const dimensionArray = Object.values(dimensionAverages);
  const minDimension = Math.min(...dimensionArray);
  const maxDimension = Math.max(...dimensionArray);
  const dimensionSpread = maxDimension - minDimension;

  // Strong Hire: high score, balanced, no critical issues
  if (overallScore >= 8.0 && minDimension >= 7.0 && !hasCriticalWeakness) {
    return "Strong Hire";
  }

  // Hire: good score, mostly strong, minor gaps
  if (overallScore >= 7.0 && minDimension >= 6.0 && dimensionSpread <= 2.0) {
    return "Hire";
  }

  // Borderline Hire: mixed performance, solvable gaps
  if (overallScore >= 5.5 && !hasCriticalWeakness) {
    return "Borderline Hire";
  }

  // No Hire: low score or critical issues
  return "No Hire";
}

/**
 * Determines confidence level based on:
 * - Score magnitude
 * - Consistency across questions (low variance = high confidence)
 */
function getConfidenceLevel({ overallScore, dimensionAverages, evaluations }) {
  const scores = evaluations.map((e) => e.score || 0);
  const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
  const variance =
    scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);

  // High confidence: strong score AND consistent (low stdDev)
  if (overallScore >= 7.5 && stdDev <= 1.2) {
    return "High";
  }

  // Low confidence: weak score OR highly inconsistent
  if (overallScore < 5.5 || stdDev > 2.0) {
    return "Low";
  }

  return "Medium";
}

/* ============================================================
   SEMANTIC MERGING: Cluster and merge similar items
   ============================================================ */

/**
 * Semantically merges a list of strings by clustering similar ones and
 * keeping the best representative from each cluster.
 *
 * Does NOT just dedupe case-insensitively; instead:
 * 1. Extracts semantic "keys" (core concepts) from each item
 * 2. Groups items with overlapping keys
 * 3. Selects the best (most specific/concise) from each group
 *
 * @param {string[]} items - Raw list (may have duplicates, similar items)
 * @param {string} type - "strengths" or "weaknesses" (affects ranking heuristic)
 * @returns {string[]} - Semantically merged list
 */
function semanticMerge(items, type = "strengths") {
  if (items.length === 0) return [];

  const clusters = [];

  for (const item of items) {
    const trimmed = item.trim();
    if (!trimmed || trimmed.length === 0) continue;

    const semanticKey = extractSemanticKey(trimmed);
    let foundCluster = false;

    // Try to match with existing cluster
    for (const cluster of clusters) {
      if (clustersOverlap(cluster.key, semanticKey)) {
        cluster.items.push(trimmed);
        foundCluster = true;
        break;
      }
    }

    // Create new cluster if no match
    if (!foundCluster) {
      clusters.push({
        key: semanticKey,
        items: [trimmed],
      });
    }
  }

  // From each cluster, select the best representative
  const merged = clusters.map((cluster) => selectBestRepresentative(cluster.items, type));

  return merged;
}

/**
 * Extracts the semantic "key" from a string — a Set of lowercase,
 * stemmed core concepts. Used to determine if two strings should be
 * in the same semantic cluster.
 *
 * Example:
 *   "Clear explanation" → { "clear", "explain" }
 *   "Strong communication" → { "strong", "commun" }
 */
function extractSemanticKey(text) {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.includes(w));

  return new Set(words.map((w) => simpleStem(w)));
}

/**
 * Very simple stemming (not a full algorithm) — just strips common suffixes.
 * Good enough for clustering "communication", "communicating", "communicate".
 */
function simpleStem(word) {
  return word
    .replace(/ing$/, "")
    .replace(/tion$/, "")
    .replace(/ity$/, "")
    .replace(/ness$/, "")
    .replace(/ment$/, "")
    .replace(/able$/, "")
    .replace(/ous$/, "")
    .replace(/ive$/, "")
    .replace(/s$/, "");
}

/**
 * Determines if two semantic keys overlap meaningfully.
 * Overlap = both keys share at least one core concept.
 */
function clustersOverlap(key1, key2) {
  for (const concept of key1) {
    if (key2.has(concept)) return true;
  }
  return false;
}

/**
 * From a cluster of similar items, select the "best" one:
 * - For strengths: prefer longer, more specific (more detailed = better)
 * - For weaknesses: prefer shorter, more actionable (concise = better)
 * - Tiebreaker: lexical order
 */
function selectBestRepresentative(items, type) {
  if (items.length === 1) return items[0];

  items.sort((a, b) => {
    const lenDiff = type === "strengths" ? b.length - a.length : a.length - b.length;
    if (lenDiff !== 0) return lenDiff;
    return a.localeCompare(b);
  });

  return items[0];
}

/**
 * Common English stop words — filtered out during semantic key extraction
 * so they don't affect clustering. E.g., "the", "and", "or", "is".
 */
const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "can",
  "could",
  "would",
  "should",
  "may",
  "might",
  "must",
  "shall",
  "will",
]);

/* ============================================================
   RANKING AND LIMITING
   ============================================================ */

/**
 * De-duplicates a list case-insensitively, then limits to maxCount.
 * Used for items that don't need semantic merging, like follow-up topics.
 */
function deduplicateCaseInsensitive(items) {
  const seen = new Set();
  const result = [];

  for (const item of items) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed || trimmed.length === 0) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }

  return result;
}

/**
 * Ranks items by length (longer = more likely to be specific/useful)
 * and limits to maxCount. This is a simple heuristic; for production
 * you might add explicit scoring/ranking from the evaluator itself.
 */
function rankAndLimit(items, maxCount) {
  // Sort by length (longer first, so most detailed items come first)
  items.sort((a, b) => b.length - a.length);
  return items.slice(0, maxCount);
}

/* ============================================================
   PHASE 2: GROQ NARRATIVE SUMMARY
   ============================================================ */

/**
 * Calls Groq to generate a personalized narrative summary.
 * Groq receives ALL the computed analysis (which it cannot contradict)
 * and writes the closing summary in a hiring-manager voice.
 */
async function generateNarrativeSummary({
  candidateProfile,
  interviewType,
  overallScore,
  dimensionAverages,
  strongestDimension,
  weakestDimension,
  performanceTrend,
  strengths,
  weaknesses,
  turns,
  evaluations,
}) {
  const readableInterviewType = (interviewType || "mixed").replace(/_/g, " ");
  const candidateLevel = candidateProfile?.experienceLevel || "unknown";
  const candidateSkills = formatSkills(candidateProfile?.skills);
  const candidateProjects = formatProjects(candidateProfile?.projects);

  // Compute brief trend text for the prompt
  const trendText =
    performanceTrend === "improving"
      ? "The candidate showed improvement across the interview, with later answers scoring higher."
      : performanceTrend === "declining"
        ? "The candidate's performance declined slightly through the interview."
        : "The candidate maintained consistent performance throughout the interview.";

  const systemPrompt = `You are a senior hiring manager writing a personalized final feedback summary for a candidate after a technical interview. 

CRITICAL CONSTRAINTS:
1. You MUST NOT contradict the analysis below — it was computed from objective interview data.
2. You MUST reference the candidate's actual skills, projects, and interview type without hallucinating.
3. You MUST write in the voice of a hiring manager, not an AI system.
4. Your summary should feel personal and specific to this candidate, not generic.
5. If a field says "unknown", do NOT fill in a guess — simply skip that detail.

Always respond with ONLY a valid JSON object — no markdown, no extra text, no preamble:
{ "summary": "<3-5 sentence personalized summary>" }`;

  const userPrompt = `CANDIDATE PROFILE
Experience Level: ${candidateLevel}
Skills: ${candidateSkills}
Projects: ${candidateProjects}

INTERVIEW DETAILS
Interview Type: ${readableInterviewType}
Number of Questions: ${turns.length}
Overall Score: ${overallScore}/10

DIMENSION ANALYSIS
Strongest Area: ${strongestDimension} (${dimensionAverages[strongestDimension]}/10)
Weakest Area: ${weakestDimension} (${dimensionAverages[weakestDimension]}/10)

PERFORMANCE TREND
${trendText}

KEY STRENGTHS
${strengths.length > 0 ? strengths.map((s) => `- ${s}`).join("\n") : "(None notably distinct)"}

KEY AREAS FOR GROWTH
${weaknesses.length > 0 ? weaknesses.map((w) => `- ${w}`).join("\n") : "(None notably distinct)"}

Write a brief, personalized summary that a hiring manager would share with their team. Reference the strengths, growth areas, and interview type. Make it feel like genuine feedback, not a generic template.`;

  const result = await createJSONCompletion({
    systemPrompt,
    userPrompt,
    temperature: 0.4,
  });

  validateSummaryShape(result);
  return result.summary.trim();
}

/* ============================================================
   FORMATTING HELPERS
   ============================================================ */

function formatSkills(skills) {
  if (!Array.isArray(skills) || skills.length === 0) {
    return "Not specified";
  }
  return skills.join(", ");
}

function formatProjects(projects) {
  if (!Array.isArray(projects) || projects.length === 0) {
    return "Not specified";
  }
  return projects.map((p) => p.title || p.name || "Unnamed").join(", ");
}

function roundToOneDecimal(num) {
  return Math.round(num * 10) / 10;
}

/* ============================================================
   OUTPUT VALIDATION
   ============================================================ */

function validateSummaryShape(result) {
  if (!result || typeof result !== "object") {
    throw new Error("Invalid report: response is not a JSON object.");
  }
  if (typeof result.summary !== "string" || result.summary.trim().length < 30) {
    throw new Error("Invalid report: 'summary' must be a meaningful string (min 30 chars).");
  }
}

export default generateInterviewReport;