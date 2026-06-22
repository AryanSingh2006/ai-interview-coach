import mongoose from "mongoose";

const EXPERIENCE_LEVELS = ["intern", "junior", "mid", "senior", "lead", "principal"];
const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    techStack: {
      type: [String],
      default: [],
    },
  },
  { _id: false }
);

const ExperienceSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      default: "",
    },

    duration: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const CandidateProfileSchema = new mongoose.Schema(
  {
    resumeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: [true, "Resume ID is required"],
      unique: true, // One profile per resume
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    experience: {
      type: [ExperienceSchema],
      default: [],
    },

    // Project entries parsed from the resume
    // Each entry: { title, description, techStack }
    projects: {
      type: [ProjectSchema],
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