import mongoose from "mongoose";

const EXPERIENCE_LEVELS = ["intern", "junior", "mid", "senior", "lead", "principal"];

const CandidateProfileSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: [true, "Resume ID is required"],
      unique: true, // One profile per resume
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // Project entries parsed from the resume
    // Each entry: { title, description, techStack }
    projects: {
      type: [mongoose.Schema.Types.Mixed],
      default: [],
    },

    // AI-inferred seniority level based on resume content
    experienceLevel: {
      type: String,
      enum: {
        values: EXPERIENCE_LEVELS,
        message: `Experience level must be one of: ${EXPERIENCE_LEVELS.join(", ")}`,
      },
      default: "junior",
    },
  },
  {
    timestamps: true,
  }
);

const CandidateProfile =
  mongoose.models.CandidateProfile ||
  mongoose.model("CandidateProfile", CandidateProfileSchema);

export default CandidateProfile;