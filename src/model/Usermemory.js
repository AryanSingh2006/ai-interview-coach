import mongoose from "mongoose";

const UserMemorySchema = new mongoose.Schema(
  {
    // The user this memory profile belongs to
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      unique: true, // One memory document per user
    },

    strengthTags: {
      type: [String],
      default: [],
    },

    weaknessTags: {
      type: [String],
      default: [],
    },

    // Vector embeddings representing the user's performance profile
    // Used for semantic similarity search or personalized recommendations
    // Each entry is a number (float). Keep flat for easy Atlas Vector Search indexing.
    embeddings: {
      type: [Number],
      default: [],
    },

    // When this memory document was last refreshed by the AI pipeline
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const UserMemory =
  mongoose.models.UserMemory || mongoose.model("UserMemory", UserMemorySchema);

export default UserMemory;