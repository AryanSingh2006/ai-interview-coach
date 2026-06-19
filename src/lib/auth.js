import bcrypt from "bcryptjs";
import { verifyToken } from "./jwt";
import { connectDB } from "./dbConnect";
import User from "@/models/User";

const SALT_ROUNDS = 10;

export async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(plainPassword, hashedPassword) {
  return await bcrypt.compare(plainPassword, hashedPassword);
}


export async function getCurrentUser(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  if (!decoded) return null;

  await connectDB();
  const user = await User.findById(decoded.userId).select("-password");
  return user;
}