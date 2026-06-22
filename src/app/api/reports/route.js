import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import InterviewSession from "@/models/Interviewsession";
import InterviewReport from "@/models/Interviewreport";

const PAGE_SIZE = 10;

export async function GET(request) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

    const total = await InterviewSession.countDocuments({
      userId: user._id,
      status: "completed",
    });

    const sessions = await InterviewSession.find({
      userId: user._id,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean();

    if (!sessions.length) {
      return NextResponse.json({ sessions: [], total: 0, page }, { status: 200 });
    }

    const sessionIds = sessions.map((s) => s._id);
    const reports = await InterviewReport.find({
      sessionId: { $in: sessionIds },
    })
      .select("sessionId overallScore strengths weaknesses")
      .lean();

    const reportMap = {};
    for (const r of reports) {
      reportMap[r.sessionId.toString()] = r;
    }

    const result = sessions.map((s) => {
      const report = reportMap[s._id.toString()] || null;
      return {
        sessionId: s._id.toString(),
        interviewType: s.interviewType,
        jobDescription: s.jobDescription,
        status: s.status,
        startedAt: s.startedAt,
        completedAt: s.completedAt,
        overallScore: report ? report.overallScore : null,
        topStrength: report?.strengths?.[0] || null,
        topWeakness: report?.weaknesses?.[0] || null,
      };
    });

    return NextResponse.json({ sessions: result, total, page }, { status: 200 });
  } catch (error) {
    console.error("GET /api/reports error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
