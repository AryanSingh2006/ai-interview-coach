import { createJSONCompletion } from "@/lib/groq";

/**
 * Generates the final interview report (overall score, strengths,
 * weaknesses, narrative summary) by AGGREGATING the per-turn evaluations
 * that evaluateAnswer() already produced during the interview, rather
 * than asking Groq to re-discover everything from a raw transcript.
 *
 * Score, strengths, weaknesses, and follow-up topics are computed
 * deterministically in code from data we already trust (every evaluation
 * was already validated by evaluateAnswer.js). Groq's only job here is
 * to write the closing narrative — which keeps this call cheap, fast,
 * and impossible to contradict what the candidate was already told
 * turn-by-turn.
 *
 * @param {Object} params
 * @param {Array} params.turns - All answered Turn documents, sorted by index
 * @param {Array} params.evaluations - All Evaluation documents for those turns
 * @returns {Promise<{overallScore:number, strengths:string[], weaknesses:string[], summary:string, recommendedFollowUpTopics:string[]}>}
 */
export async function generateInterviewReport({ candidateProfile, interviewType, turns, evaluations }) {
  if (!Array.isArray(turns) || turns.length === 0) {
    throw new Error("generateInterviewReport requires a non-empty 'turns' array.");
  }
  if (!Array.isArray(evaluations) || evaluations.length === 0) {
    throw new Error("generateInterviewReport requires a non-empty 'evaluations' array.");
  }

  // --- Deterministic aggregation — no Groq call needed for any of this ---
  const overallScore = roundToOneDecimal(calculateOverallScore(evaluations));
  const dimensionAverages = aggregateDimensionScores(evaluations);
  const strengths = aggregateUniqueList(evaluations.flatMap((e) => e.strengths || []));
  const weaknesses = aggregateUniqueList(evaluations.flatMap((e) => e.weaknesses || []));
  const recommendedFollowUpTopics = aggregateUniqueList(
    evaluations.flatMap((e) => e.recommendedFollowUpTopics || [])
  );

  const evaluationByTurnId = new Map(
    evaluations.filter((e) => e?.turnId).map((e) => [e.turnId.toString(), e])
  );

  // Compact score-only transcript — Groq only needs this for narrative
  // tone/trend now, not to re-judge any individual answer, so it stays
  // far smaller than the full Q&A transcript the old version sent.
  const scoreTrend = turns
    .map((turn, i) => {
      const evaluation = evaluationByTurnId.get(turn._id?.toString());

      if (!evaluation) {
        return `Q${i + 1}: No evaluation`;
      }

      return `
Question ${i + 1}
Type: ${turn.questionType}
Score: ${evaluation.score}/10

Strengths:
${(evaluation.strengths || [])
          .map((s) => `- ${s}`)
          .join("\n") || "None"}

Weaknesses:
${(evaluation.weaknesses || [])
          .map((w) => `- ${w}`)
          .join("\n") || "None"}
`;
    })
    .join("\n\n");

  const systemPrompt = `You are a senior hiring manager writing the closing narrative for an interview report.
The overall score, strengths, and weaknesses below have ALREADY been determined from per-question evaluations made during the interview — do not invent new ones, contradict them, or restate the raw transcript.
Your summary should:
1. Assess overall performance.
2. Mention strongest demonstrated skills.
3. Mention biggest growth areas.
4. Comment on consistency throughout the interview.
5. Be written like feedback a hiring manager would share with a hiring team.
Always respond with ONLY a valid JSON object — no markdown, no extra text, no preamble:
{ "summary": "<3-5 sentence overall narrative summary>" }`;

  const userPrompt = `
  Candidate Experience Level:
${candidateProfile?.experienceLevel || "unknown"}

Interview Type:
${interviewType || "unknown"}
  Overall score: ${overallScore}/10

Candidate Skills:
${formatSkills(candidateProfile?.skills)}

Candidate Projects:
${formatProjects(candidateProfile?.projects)}

Dimension averages:
${Object.entries(dimensionAverages)
      .map(([name, score]) => `- ${name}: ${score}/10`)
      .join("\n")}

Strengths observed across the interview:
${strengths.length > 0 ? strengths.map((s) => `- ${s}`).join("\n") : "None notably distinct."}

Weaknesses observed across the interview:
${weaknesses.length > 0 ? weaknesses.map((w) => `- ${w}`).join("\n") : "None notably distinct."}

Question-by-question score trend:
${scoreTrend}

Write the summary now.`;

  const result = await createJSONCompletion({
    systemPrompt,
    userPrompt,
    temperature: 0.4,
  });

  validateSummaryShape(result);

  return {
    overallScore,
    dimensionAverages,
    strengths,
    weaknesses,
    summary: result.summary.trim(),
    recommendedFollowUpTopics,
  };
}

/* ============================================================
   AGGREGATION HELPERS
   ============================================================ */

function calculateOverallScore(evaluations) {
  const total = evaluations.reduce((sum, e) => sum + (e.score || 0), 0);
  return total / evaluations.length;
}

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
    averages[name] =
      Math.round((totals[name] / counts[name]) * 10) / 10;
  }

  return averages;
}

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

  return projects
    .map((project) => project.title || project.name)
    .join(", ");
}

/**
 * Dedupes a list of short strings case-insensitively, keeping the first
 * casing seen. Used to merge strengths/weaknesses/follow-up topics across
 * every turn's evaluation without showing the same point five times just
 * because it came up in five different questions.
 */
function aggregateUniqueList(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (typeof item !== "string") continue;
    const trimmed = item.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
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
  if (typeof result.summary !== "string" || result.summary.trim().length < 50) {
    throw new Error("Invalid report: 'summary' must be a non-empty string.");
  }
}

export default generateInterviewReport;