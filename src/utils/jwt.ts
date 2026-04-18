import jwt from "jsonwebtoken";
import type{ JwtPayload } from "../middleware/authMiddleware.js";

export function signToken(payload: { userId: number; email: string; role: string }) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as unknown as JwtPayload;
}