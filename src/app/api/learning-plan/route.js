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

    // Find the most recently completed session for this user
    const lastSession = await InterviewSession.findOne({
      userId: user._id,
      status: "completed",
    })
      .sort({ completedAt: -1 })
      .lean();

    if (!lastSession) {
      return NextResponse.json({ topics: [] });
    }

    const report = await InterviewReport.findOne({ sessionId: lastSession._id }).lean();

    if (!report || !report.recommendedFollowUpTopics?.length) {
      return NextResponse.json({ topics: [] });
    }

    return NextResponse.json({ topics: report.recommendedFollowUpTopics });
  } catch (error) {
    console.error("GET /api/learning-plan error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
