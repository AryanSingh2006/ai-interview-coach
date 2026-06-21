import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    }
  },
  {
    timestamps: true,
  }
);

// Index on email for fast login lookups
UserSchema.index({ email: 1 });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;