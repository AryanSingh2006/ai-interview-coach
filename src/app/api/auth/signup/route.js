import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { generateToken } from "@/lib/jwt";
import { COOKIE_NAME, cookieOptions } from "@/lib/cookieOptions";

export async function POST(request) {
  try {
    await connectDB();

    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    // Log the user in right away by issuing a token
    const token = generateToken({ userId: newUser._id });

    const response = NextResponse.json(
      {
        message: "Account created successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );

    response.cookies.set(COOKIE_NAME, token, cookieOptions);

    return response;
  } catch (error) {
    // Mongoose schema validation errors (e.g. bad email format, short password)
    if (error.name === "ValidationError") {
      const firstMessage = Object.values(error.errors)[0].message;
      return NextResponse.json({ message: firstMessage }, { status: 400 });
    }

    console.error("Signup error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}