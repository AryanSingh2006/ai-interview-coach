import { connectDB } from "@/lib/dbConnect";

export async function GET() {
  try {
    await connectDB();

    return Response.json({
      success: true,
      message: "Database connected successfully",
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    );
  }
}