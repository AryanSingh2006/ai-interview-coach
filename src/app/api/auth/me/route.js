import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import User from "@/models/User";

export async function GET(request) {
  try {
    const user = await getCurrentUser(request);

    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const name = body?.name?.trim();

    if (!name) {
      return NextResponse.json({ message: "Name is required" }, { status: 400 });
    }
    if (name.length > 100) {
      return NextResponse.json({ message: "Name cannot exceed 100 characters" }, { status: 400 });
    }

    const updated = await User.findByIdAndUpdate(
      user._id,
      { name },
      { new: true, runValidators: true }
    ).select("-password");

    return NextResponse.json({ user: updated }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/auth/me error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}