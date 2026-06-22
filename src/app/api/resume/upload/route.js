import { NextResponse } from "next/server";
import { connectDB } from "@/lib/dbConnect";
import { getCurrentUser } from "@/lib/auth";
import cloudinary from "@/lib/cloudinary";
import Resume from "@/models/Resume";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB 

export async function POST(request) {
  try {
    await connectDB();

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("multipart/form-data")) {
      return NextResponse.json(
        { message: "Content-Type must be multipart/form-data" },
        { status: 415 }
      );
    }

    // Read the uploaded file from multipart form data
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: "Only PDF or DOCX files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "File size must be under 5MB" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "raw",
          folder: "resumes",
          public_id: `${user._id}-${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    const resume = await Resume.create({
      userId: user._id,
      blobUrl: uploadResult.secure_url,
      fileName: file.name,
      parseStatus: "pending",
    });

    return NextResponse.json(
      {
        success: true,
        resumeId: resume._id,
        fileUrl: resume.blobUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    if (
      error instanceof TypeError &&
      String(error.message).includes("Content-Type was not one of")
    ) {
      return NextResponse.json(
        { message: "Invalid form submission. Use multipart/form-data." },
        { status: 400 }
      );
    }

    console.error("Resume upload error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}