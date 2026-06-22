import mongoose from "mongoose";

// Types of interviews the AI coach can simulate
const INTERVIEW_TYPES = [
  "behavioral",     // Situational / STAR-method questions
  "technical",      // Coding & system design questions
  "system_design",  // Architecture-focused deep dives
  "hr",             // Culture fit, salary, expectations
  "mixed",          // Combination of the above
];

// Lifecycle states of a session
const SESSION_STATUSES = [
  "created",     // Session initialized but not yet started
  "in_progress", // User is actively answering questions
  "ready_for_completion", //interview is completed but the report generation is remaining
  "completed",   // All questions answered, report pending
  "abandoned",   // User left without finishing
];

const InterviewSessionSchema = new mongoose.Schema(
  {
    // The candidate taking this interview
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },

    candidateProfileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidateprofile",
      required: true,
    },

    // Controls the question strategy used by the AI
    interviewType: {
      type: String,
      enum: {
        values: INTERVIEW_TYPES,
        message: `Interview type must be one of: ${INTERVIEW_TYPES.join(", ")}`,
      },
      required: [true, "Interview type is required"],
    },

    // Pasted job description used to tailor questions
    jobDescription: {
      type: String,
      default: "",
    },

    // Optional: company name for context-aware question generation
    targetCompany: {
      type: String,
      trim: true,
      default: "",
    },

    // Current lifecycle state of this session
    status: {
      type: String,
      enum: {
        values: SESSION_STATUSES,
        message: `Status must be one of: ${SESSION_STATUSES.join(", ")}`,
      },
      default: "created",
    },

    // When the user actually began answering (not when session was created)
    startedAt: {
      type: Date,
      default: null,
    },
    
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index: fetch all sessions for a user sorted by time
InterviewSessionSchema.index({ userId: 1, createdAt: -1 });

const InterviewSession =
  mongoose.models.InterviewSession ||
  mongoose.model("InterviewSession", InterviewSessionSchema);

export default InterviewSession;