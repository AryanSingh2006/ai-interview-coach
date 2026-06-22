import Groq from "groq-sdk";


if (!process.env.GROQ_API_KEY) {
  throw new Error(
    "Missing GROQ_API_KEY environment variable. Add it to your .env file."
  );
}

export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const GROQ_MODEL = "llama-3.3-70b-versatile";

/**
 * @param {Object} params
 * @param {string} params.systemPrompt - Defines the AI's role + exact output shape
 * @param {string} params.userPrompt - The task-specific content for this call
 * @param {number} [params.temperature=0.4] - Lower = more consistent/deterministic output
 * @returns {Promise<Object>} Parsed JSON object from the model's response
 * @throws {Error} If Groq returns empty content or invalid JSON
 */

export async function createJSONCompletion({
  systemPrompt,
  userPrompt,
  temperature = 0.4,
}) {
  console.log("KEY:", JSON.stringify(process.env.GROQ_API_KEY));
  console.log("KEY LENGTH:", process.env.GROQ_API_KEY?.length);
  try {
    const completion = await groq.chat.completions.create({
      model: GROQ_MODEL,
      temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });
    console.log("Groq Response:", completion);

    console.log(
      "Loaded key:",
      process.env.GROQ_API_KEY?.slice(0, 20)
    );

    const rawContent = completion?.choices?.[0]?.message?.content;

    if (!rawContent) {
      throw new Error("Groq returned an empty response.");
    }

    return JSON.parse(rawContent);
  } catch (error) {
    console.error("GROQ ERROR:", error);
    throw error;
  }
}

export default groq;