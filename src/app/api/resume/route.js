import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import Resume from "@/models/Resume";

export async function GET(request) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const resumes = await Resume.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .select("_id fileName parseStatus createdAt")
      .lean();

    return NextResponse.json({ resumes }, { status: 200 });
  } catch (error) {
    console.error("GET /api/resume error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
