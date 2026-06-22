// src/app/api/interview/start/route.js
import mongoose from "mongoose";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import Resume from "@/models/Resume";
import Candidateprofile from "@/models/Candidateprofile";
import Interviewsession from "@/models/Interviewsession";
import Turn from "@/models/Turn";
import { parseResume } from "@/lib/parseResume";
import { generateFirstQuestion } from "@/lib/questionGenerator";

export async function POST(request) {
  try {
    await connectDB();

    // 1. Verify authenticated user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { resumeId, jobDescription, interviewType, targetCompany } = await request.json();

    if (!resumeId || !jobDescription || !interviewType) {
      return NextResponse.json(
        { message: "resumeId, jobDescription, and interviewType are required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(resumeId)) {
      return NextResponse.json({ message: "resumeId must be a valid resume ObjectId" }, { status: 400 });
    }

    // 2. Load the resume and verify it belongs to this user
    const resume = await Resume.findOne({ _id: resumeId, userId: user._id });
    if (!resume) {
      return NextResponse.json({ message: "Resume not found" }, { status: 404 });
    }

    // 3. Each resume gets its OWN profile — scoped by resumeId, not userId.
    //    Resume A's profile is never reused for Resume B.
    let candidateProfile = await Candidateprofile.findOne({ resumeId: resume._id });

    if (!candidateProfile) {
      try {
        const parsedData = await parseResume(resume.blobUrl, resume.fileName);

        candidateProfile = await Candidateprofile.create({
          userId: user._id,
          resumeId: resume._id,
          skills: parsedData.skills,
          experience: parsedData.experience,
          projects: parsedData.projects,
          experienceLevel: parsedData.experienceLevel,
        });

        resume.parseStatus = "completed";
        await resume.save();
      } catch (parseError) {
        resume.parseStatus = "failed";
        await resume.save();
        throw parseError;
      }
    }

    // 4. Create the interview session
    const interviewSession = await Interviewsession.create({
      userId: user._id,
      resumeId: resume._id,
      candidateProfileId: candidateProfile._id,
      jobDescription,
      interviewType,
      targetCompany: targetCompany?.trim() || "",
      status: "in_progress",
    });

    // 5. Generate the first question — grounded in the real profile + job description
    const { question, questionType } = await generateFirstQuestion({
      candidateProfile,
      interviewType,
      jobDescription,
    });

    // 6. Record it as Turn #0
    await Turn.create({
      sessionId: interviewSession._id,
      index: 0,
      question,
      answer: "",
      questionType,
    });

    return NextResponse.json(
      {
        success: true,
        sessionId: interviewSession._id,
        firstQuestion: question,
        questionType,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.name === "ValidationError") {
      const firstMessage = Object.values(error.errors)[0].message;
      return NextResponse.json({ message: firstMessage }, { status: 400 });
    }

    // Resume itself was the problem (bad file type, unreadable, too short) — the
    // user can fix this by re-uploading, so it's a 422, not a generic 500.
    if (
      error.message?.includes("Unsupported file type") ||
      error.message?.includes("too short") ||
      error.message?.includes("Failed to download") ||
      error.message?.includes("Resume parsing failed")
    ) {
      return NextResponse.json({ message: error.message }, { status: 422 });
    }

    console.error("Interview start error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}