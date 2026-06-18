import mongoose from "mongoose";

const QUESTION_TYPES = [
  "behavioral",     
  "technical",      
  "coding",         
  "system_design",  
  "situational",    
  "hr",             
];

const TurnSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InterviewSession",
      required: [true, "Session ID is required"],
      index: true,
    },

    index: {
      type: Number,
      required: [true, "Turn index is required"],
      min: [0, "Index must be a non-negative number"],
    },

    question: {
      type: String,
      required: [true, "Question is required"],
    },

    answer: {
      type: String,
      default: "",
    },

    questionType: {
      type: String,
      enum: {
        values: QUESTION_TYPES,
        message: `Question type must be one of: ${QUESTION_TYPES.join(", ")}`,
      },
      required: [true, "Question type is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Enforce turn order uniqueness within a session
TurnSchema.index({ sessionId: 1, index: 1 }, { unique: true });

const Turn = mongoose.models.Turn || mongoose.model("Turn", TurnSchema);

export default Turn;