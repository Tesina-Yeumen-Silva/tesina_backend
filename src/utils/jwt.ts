import jwt from "jsonwebtoken";
import crypto from "crypto";

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
}

export function signAccessToken(payload: JwtPayload) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "15m" });
}

export function signRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as unknown as JwtPayload;
}