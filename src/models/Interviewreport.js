import mongoose from "mongoose";

const InterviewReportSchema = new mongoose.Schema(
  {
    // The session this report summarizes
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: [true, "Session ID is required"],
      unique: true, // One report per session
    },

    overallScore: {
      type: Number,
      required: [true, "Overall score is required"],
      min: [0, "Score cannot be less than 0"],
      max: [10, "Score cannot exceed 10"],
    },

    strengths: {
      type: [String],
      default: [],
    },

    weaknesses: {
      type: [String],
      default: [],
    },

    summary: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const InterviewReport =
  mongoose.models.InterviewReport ||
  mongoose.model("InterviewReport", InterviewReportSchema);

export default InterviewReport;
