import mongoose from "mongoose";

const ResourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, default: "" },
    type: {
      type: String,
      enum: ["article", "video", "course", "book", "practice", "other"],
      default: "article",
    },
  },
  { _id: false }
);

const TopicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    completed: { type: Boolean, default: false },
  },
  { _id: false }
);

const LearningPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },

    topics: {
      type: [TopicSchema],
      default: [],
    },

    resources: {
      type: [ResourceSchema],
      default: [],
    },

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const LearningPlan =
  mongoose.models.LearningPlan ||
  mongoose.model("LearningPlan", LearningPlanSchema);

export default LearningPlan;