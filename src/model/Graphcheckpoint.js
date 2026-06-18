import mongoose from "mongoose";

// GraphCheckpoint stores LangGraph (or similar AI graph framework) state.
// Each document is a snapshot of a running agent's state at a point in time.
// The thread_id ties together all checkpoints for one agent "conversation".

const GraphCheckpointSchema = new mongoose.Schema(
  {
    // Unique identifier for the agent thread (from LangGraph / your orchestrator)
    // Multiple checkpoints can share the same thread_id (one per step/node)
    thread_id: {
      type: String,
      required: [true, "Thread ID is required"],
      index: true,
    },

    // Full serialized graph state at this checkpoint
    // Stored as Mixed so any shape from the framework can be saved without migration
    checkpoint: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Framework-level metadata (e.g. node name, timestamp, step number)
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // createdAt acts as a natural ordering key for replay
  }
);

// Fetch all checkpoints for a thread ordered by creation time (for replay)
GraphCheckpointSchema.index({ thread_id: 1, createdAt: 1 });

const GraphCheckpoint =
  mongoose.models.GraphCheckpoint ||
  mongoose.model("GraphCheckpoint", GraphCheckpointSchema);

export default GraphCheckpoint;