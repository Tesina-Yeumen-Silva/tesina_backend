import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { JwtPayload, RegisterPayload } from "../types/auth.js";

const JWT_SECRET = process.env.JWT_SECRET!;

const TOKEN_CONFIG = {
  access: { expiresIn: "7d" },
  register: { expiresIn: "15m" },
} as const;

export function signToken<T extends object>(
  type: keyof typeof TOKEN_CONFIG,
  payload: T,
): string {
  return jwt.sign(payload, JWT_SECRET, TOKEN_CONFIG[type]);
}

export function verifyToken<T = JwtPayload>(token: string): T {
  return jwt.verify(token, JWT_SECRET) as T;
}

export const signAccessToken = (p: JwtPayload) => signToken("access", p);
export const signRegisterToken = (p: RegisterPayload) =>
  signToken("register", p);
export const verifyRegisterToken = (t: string) =>
  verifyToken<RegisterPayload>(t);
export const signRefreshToken = () => crypto.randomBytes(64).toString("hex");
