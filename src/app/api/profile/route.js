import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import InterviewSession from "@/models/Interviewsession";
import InterviewReport from "@/models/Interviewreport";
import Evaluation from "@/models/Evaluation";

export async function GET(request) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const completedSessions = await InterviewSession.find({
      userId: user._id,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .lean();

    const totalInterviews = completedSessions.length;

    if (totalInterviews === 0) {
      return NextResponse.json({
        user: { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
        totalInterviews: 0,
        avgScore: 0,
        bestScore: 0,
        skills: [],
      });
    }

    const sessionIds = completedSessions.map((s) => s._id);

    // Fetch all reports for score stats
    const reports = await InterviewReport.find({ sessionId: { $in: sessionIds } }).lean();

    let avgScore = 0;
    let bestScore = 0;
    if (reports.length > 0) {
      const scores = reports.map((r) => r.overallScore);
      bestScore = Math.max(...scores);
      avgScore = Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;
    }

    // Aggregate per-dimension averages from Evaluations
    const evaluations = await Evaluation.find({ sessionId: { $in: sessionIds } }).lean();

    const dimensionTotals = {};
    const dimensionCounts = {};
    for (const ev of evaluations) {
      for (const ds of ev.dimensionScores || []) {
        if (!ds.dimension) continue;
        dimensionTotals[ds.dimension] = (dimensionTotals[ds.dimension] || 0) + ds.score;
        dimensionCounts[ds.dimension] = (dimensionCounts[ds.dimension] || 0) + 1;
      }
    }

    const skills = Object.entries(dimensionTotals).map(([dimension, total]) => ({
      dimension,
      avgScore: Math.round((total / dimensionCounts[dimension]) * 10) / 10,
    }));

    return NextResponse.json({
      user: { _id: user._id, name: user.name, email: user.email, createdAt: user.createdAt },
      totalInterviews,
      avgScore,
      bestScore,
      skills,
    });
  } catch (error) {
    console.error("GET /api/profile error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
