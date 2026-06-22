import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import InterviewSession from "@/models/Interviewsession";
import InterviewReport from "@/models/Interviewreport";

export async function GET(request) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    // All completed sessions for this user
    const completedSessions = await InterviewSession.find({
      userId: user._id,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .lean();

    const totalSessions = completedSessions.length;

    if (totalSessions === 0) {
      return NextResponse.json({
        totalSessions: 0,
        avgScore: 0,
        topStrength: null,
        topWeakness: null,
        recentSessions: [],
      });
    }

    const sessionIds = completedSessions.map((s) => s._id);

    // All reports for those sessions
    const reports = await InterviewReport.find({
      sessionId: { $in: sessionIds },
    }).lean();

    // Build a map: sessionId -> report
    const reportMap = {};
    for (const r of reports) {
      reportMap[r.sessionId.toString()] = r;
    }

    // Compute avg score
    let scoreSum = 0;
    let scoreCount = 0;
    const allStrengths = [];
    const allWeaknesses = [];

    for (const r of reports) {
      scoreSum += r.overallScore;
      scoreCount++;
      if (r.strengths) allStrengths.push(...r.strengths);
      if (r.weaknesses) allWeaknesses.push(...r.weaknesses);
    }

    const avgScore = scoreCount > 0 ? Math.round((scoreSum / scoreCount) * 10) / 10 : 0;

    // Top strength / weakness = most frequently occurring item
    const topStrength = mostFrequent(allStrengths);
    const topWeakness = mostFrequent(allWeaknesses);

    // 5 most recent sessions with their report data
    const recentSessions = completedSessions.slice(0, 5).map((s) => {
      const report = reportMap[s._id.toString()];
      return {
        sessionId: s._id.toString(),
        interviewType: s.interviewType,
        overallScore: report ? report.overallScore : null,
        completedAt: s.completedAt,
      };
    });

    return NextResponse.json({
      totalSessions,
      avgScore,
      topStrength,
      topWeakness,
      recentSessions,
    });
  } catch (error) {
    console.error("GET /api/dashboard error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

function mostFrequent(arr) {
  if (!arr.length) return null;
  const freq = {};
  for (const item of arr) {
    freq[item] = (freq[item] || 0) + 1;
  }
  return Object.entries(freq).sort((a, b) => b[1] - a[1])[0][0];
}
