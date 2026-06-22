import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import Interviewsession from "@/models/Interviewsession";
import Turn from "@/models/Turn";
import Evaluation from "@/models/Evaluation";
import Interviewreport from "@/models/Interviewreport";
import { generateInterviewReport } from "@/lib/Generateinterviewreport";
import Candidateprofile from "@/models/Candidateprofile";

/**
 * POST /api/interview/[sessionId]/complete
 *
 * Ends the interview: pulls the full transcript + scores, asks Groq for a
 * final narrative report (aggregating data already collected turn-by-turn),
 * saves it, and marks the session completed.
 */
export async function POST(request, { params }) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);
    console.log("CURRENT USER:", user);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    if (!mongoose.isValidObjectId(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const session = await Interviewsession.findById(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    if (
      session.status !== "ready_for_completion" &&
      session.status !== "completed"
    ) {
      return NextResponse.json(
        {
          error:
            "Interview is not ready for completion yet",
        },
        { status: 400 }
      );
    }

    if (session.userId.toString() !== user._id.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (session.status === "completed") {
      const existingReport =
        await Interviewreport.findOne({
          sessionId: session._id,
        });

      if (existingReport) {
        return NextResponse.json(
          { report: existingReport },
          { status: 200 }
        );
      }
    }

    // Only count turns that were actually answered (ignore the trailing
    // unanswered turn created for "what's next")
    const allTurns = await Turn.find({
      sessionId: session._id,
      answer: { $ne: "" },
    }).sort({ index: 1 });

    if (allTurns.length === 0) {
      return NextResponse.json(
        { error: "Cannot complete an interview with no answered questions" },
        { status: 400 }
      );
    }

    const turnIds = allTurns.map((t) => t._id);
    const allEvaluations = await Evaluation.find({ turnId: { $in: turnIds } });

    if (allEvaluations.length === 0) {
      return NextResponse.json(
        { error: "No evaluations found for this session" },
        { status: 400 }
      );
    }

    const candidateProfile = session.candidateProfileId
      ? await Candidateprofile.findById(session.candidateProfileId)
      : null;

    const reportResult = await generateInterviewReport({
      candidateProfile,
      interviewType: session.interviewType,
      turns: allTurns,
      evaluations: allEvaluations,
    });

    const report = await Interviewreport.create({
      sessionId: session._id,
      overallScore: reportResult.overallScore,
      dimensionAverages: reportResult.dimensionAverages,
      strengths: reportResult.strengths,
      weaknesses: reportResult.weaknesses,
      summary: reportResult.summary,
      recommendedFollowUpTopics:
        reportResult.recommendedFollowUpTopics || [],
    });

    session.status = "completed";
    session.completedAt = new Date();
    await session.save();

    return NextResponse.json(
      {
        report: {
          sessionId: report.sessionId,
          overallScore: report.overallScore,
          dimensionAverages: report.dimensionAverages,
          strengths: report.strengths,
          weaknesses: report.weaknesses,
          summary: report.summary,
          recommendedFollowUpTopics: report.recommendedFollowUpTopics,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("POST /api/interview/[sessionId]/complete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}