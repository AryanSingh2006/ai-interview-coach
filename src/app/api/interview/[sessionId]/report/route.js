import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import InterviewSession from "@/models/Interviewsession";
import InterviewReport from "@/models/Interviewreport";

export async function GET(request, { params }) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    if (!mongoose.isValidObjectId(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    // Confirm the session belongs to this user
    const session = await InterviewSession.findById(sessionId).lean();
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    if (session.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const report = await InterviewReport.findOne({ sessionId }).lean();
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Convert dimensionAverages Map to plain object for JSON serialisation
    const dimensionAverages = report.dimensionAverages instanceof Map
      ? Object.fromEntries(report.dimensionAverages)
      : report.dimensionAverages || {};

    return NextResponse.json(
      {
        report: {
          sessionId: report.sessionId.toString(),
          overallScore: report.overallScore,
          dimensionAverages,
          strengths: report.strengths,
          weaknesses: report.weaknesses,
          recommendedFollowUpTopics: report.recommendedFollowUpTopics,
          summary: report.summary,
          interviewType: report.interviewType,
          completedAt: report.completedAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/interview/[sessionId]/report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
