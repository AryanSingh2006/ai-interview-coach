import { NextResponse } from "next/server";
import { COOKIE_NAME, cookieOptions } from "@/lib/cookieOptions";

export async function POST() {
  const response = NextResponse.json({ message: "Logged out successfully" }, { status: 200 });

  // Overwrite the cookie with an empty value and immediate expiry
  response.cookies.set(COOKIE_NAME, "", {
    ...cookieOptions,
    maxAge: 0,
  });

  return response;
}