// src/lib/parseResume.js
import { PDFParse } from "pdf-parse";
import { WorkerMessageHandler } from "pdfjs-dist/legacy/build/pdf.worker.mjs";
import mammoth from "mammoth";
import { createJSONCompletion } from "./groq";

globalThis.pdfjsWorker = { WorkerMessageHandler };

const REQUIRED_FIELDS = ["skills", "experience", "projects", "experienceLevel"];
const VALID_EXPERIENCE_LEVELS = ["intern", "junior", "mid", "senior", "lead", "principal"];
const MAX_CHARS_FOR_PROMPT = 12000; // keeps token usage/cost predictable for long resumes

/**
 * Downloads the resume file from its Cloudinary URL as a Buffer.
 */
async function downloadFile(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to download resume from storage");
  }
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Detects file type from the stored filename first, then falls back to the URL.
 */
function detectFileType(url, fileName = "") {
  const cleanFileName = fileName.toLowerCase();
  if (cleanFileName.endsWith(".pdf")) return "pdf";
  if (cleanFileName.endsWith(".docx")) return "docx";

  const cleanUrl = url.split("?")[0].toLowerCase();
  if (cleanUrl.endsWith(".pdf")) return "pdf";
  if (cleanUrl.endsWith(".docx")) return "docx";
  throw new Error("Unsupported file type. Only PDF and DOCX are supported.");
}

/**
 * Extracts raw text from a PDF or DOCX buffer.
 */
async function extractText(buffer, fileType) {
  if (fileType === "pdf") {
    const parser = new PDFParse({ data: buffer });
    try {
      const data = await parser.getText();
      return data.text;
    } finally {
      await parser.destroy();
    }
  }
  // fileType === "docx"
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Builds the prompt sent to Groq for structured extraction.
 * Kept in its own function so the prompt can be tuned without touching call logic.
 */
function buildExtractionPrompt(resumeText) {
  return `
  Extract structured information from the resume text below.

Resume Text:

"""
${resumeText}
"""

Return a JSON object with EXACTLY this structure:

{
"skills": [],
"experience": [],
"projects": [],
"experienceLevel": ""
}

Field Requirements:

1. skills

* Array of strings.
* Include technical skills, programming languages, frameworks, databases, cloud platforms, tools, and explicitly mentioned soft skills.

Example:

[
"JavaScript",
"React",
"Node.js",
"MongoDB",
"Git"
]

2. experience

* Array of objects.
* One object per professional role, internship, freelance engagement, research position, or significant work experience.

Structure:

[
{
"company": "",
"role": "",
"duration": "",
"description": ""
}
]

Rules:

* company = organization name if available
* role = job title or position
* duration = employment duration exactly as stated
* description = short summary of responsibilities and achievements

Example:

[
{
"company": "XYZ Technologies",
"role": "Backend Developer Intern",
"duration": "6 months",
"description": "Built REST APIs using Node.js and MongoDB."
}
]

3. projects

* Array of objects.
* One object per project.

Structure:

[
{
"title": "",
"description": "",
"techStack": []
}
]

Rules:

* title = project name
* description = concise summary of what was built
* techStack = technologies explicitly mentioned for that project

Example:

[
{
"title": "VoteChain",
"description": "Blockchain-based voting platform with secure voter authentication.",
"techStack": [
"React",
"Node.js",
"MongoDB",
"Solidity"
]
}
]

4. experienceLevel

Must be EXACTLY one of:

* intern
* junior
* mid
* senior
* lead
* principal

Classification Rules:

intern

* Student
* Fresher
* No professional experience
* Internship experience only

junior

* 0–2 years professional experience

mid

* 2–5 years professional experience

senior

* 5–8 years professional experience

lead

* 8+ years experience
* Technical leadership responsibilities

principal

* Staff/Principal level engineer
* Significant architecture and technical leadership responsibilities

Rules:

* Only use information explicitly present in the resume.
* Never invent projects, companies, durations, technologies, responsibilities, or skills.
* If information is missing, return an empty array.
* If experience level cannot be confidently determined, choose the closest valid level using only available resume information.
* Respond ONLY with valid JSON.
* No markdown.
* No explanations.
* No additional text.
`;
}

/**
 * Validates the shape of the AI's parsed output before it's trusted by the rest of the app.
 * Throwing here means bad/incomplete AI output never silently reaches the database.
 */
function validateParsedData(data) {
  for (const field of REQUIRED_FIELDS) {
    if (!(field in data)) {
      throw new Error(`Resume parsing failed: missing field "${field}"`);
    }
  }

  if (
    !Array.isArray(data.skills) ||
    !Array.isArray(data.experience) ||
    !Array.isArray(data.projects)
  ) {
    throw new Error("Resume parsing failed: skills, experience, and projects must be arrays");
  }

  if (!VALID_EXPERIENCE_LEVELS.includes(data.experienceLevel)) {
    throw new Error(
      'Resume parsing failed: experienceLevel must be "intern", "junior", "mid", "senior", "lead", or "principal"'
    );
  }

  return data;
}

/**
 * parseResume — internal helper, NOT an API route.
 * Downloads a resume, extracts its text, and returns structured candidate data.
 *
 * @param {string} resumeUrl - Cloudinary secure_url of the resume file
 * @returns {Promise<{skills: string[], experience: string[], projects: string[], experienceLevel: string}>}
 */
export async function parseResume(resumeUrl, fileName = "") {
  const buffer = await downloadFile(resumeUrl);
  const fileType = detectFileType(resumeUrl, fileName);
  const resumeText = (await extractText(buffer, fileType)).trim();

  if (resumeText.length < 50) {
    throw new Error("Resume text could not be extracted or is too short to parse");
  }

  const truncatedText = resumeText.slice(0, MAX_CHARS_FOR_PROMPT);

  let parsedData;
  try {
    parsedData = await createJSONCompletion({
      systemPrompt:
        "You are a precise resume-parsing engine. You extract only facts explicitly stated in the provided text, never inferred or invented details. You always respond with valid JSON matching the requested schema.",
      userPrompt: buildExtractionPrompt(truncatedText),
      temperature: 0, // deterministic, factual extraction - not creative
    });
  } catch (error) {
    throw new Error(`Resume parsing failed: ${error.message}`);
  }

  return validateParsedData(parsedData);
}