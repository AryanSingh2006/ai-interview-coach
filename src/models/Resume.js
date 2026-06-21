import mongoose from "mongoose";

const PARSE_STATUSES = ["pending", "processing", "completed", "failed"];

const ResumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true, // Query resumes by user frequently
    },

    blobUrl: {
      type: String,
      required: [true, "Blob URL is required"],
      trim: true
    },

    fileName: {
      type: String,
      required: [true, "File name is required"],
      trim: true,
    },

    parseStatus: {
      type: String,
      enum: {
        values: PARSE_STATUSES,
        message: `Parse status must be one of: ${PARSE_STATUSES.join(", ")}`,
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.models.Resume || mongoose.model("Resume", ResumeSchema);

export default Resume;