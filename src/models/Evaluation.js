import mongoose from "mongoose";

// Sub-schema for individual scoring dimensions
// e.g. { dimension: "clarity", score: 8, comment: "Well-structured answer" }
const DimensionScoreSchema = new mongoose.Schema(
  {
    // Name of the scoring category (e.g. "relevance", "depth", "communication")
    dimension: {
      type: String,
      required: true,
    },

    // Score for this dimension (0–10 scale)
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },

    // Short AI-generated comment explaining the score
    comment: {
      type: String,
      default: "",
    },
  },
  { _id: false } // No separate _id needed for embedded sub-documents
);


const EvaluationSchema = new mongoose.Schema(
  {
    // The question-answer turn being evaluated
    turnId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Turn",
      required: [true, "Turn ID is required"],
      unique: true, // One evaluation per turn
    },

    // Overall score for this turn (0–10)
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: [0, "Score cannot be less than 0"],
      max: [10, "Score cannot exceed 10"],
    },

    // Breakdown by individual rubric dimensions
    dimensionScores: {
      type: [DimensionScoreSchema],
      default: [],
    },

    // Detailed AI feedback paragraph shown to the candidate
    feedback: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Evaluation =
  mongoose.models.Evaluation || mongoose.model("Evaluation", EvaluationSchema);

export default Evaluation;