import jwt from "jsonwebtoken";
import crypto from "crypto";
import type { JwtPayload, RegisterPayload } from "../types/auth.js";
import { encrypt, decrypt } from "./crypto.js";

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

/**
 * Firma el token de registro cifrando todo su payload.
 * Esto evita que el cliente pueda decodificar la contraseña (passwordHash).
 */
export const signRegisterToken = (p: RegisterPayload) => {
  const encryptedData = encrypt(JSON.stringify(p), JWT_SECRET);
  return signToken("register", { data: encryptedData });
};

/**
 * Verifica el token de registro y descifra su contenido para recuperar el payload original.
 */
export const verifyRegisterToken = (t: string): RegisterPayload => {
  const decoded = verifyToken<{ data: string }>(t);
  const decryptedPayload = decrypt(decoded.data, JWT_SECRET);
  return JSON.parse(decryptedPayload) as RegisterPayload;
};

export const signRefreshToken = () => crypto.randomBytes(64).toString("hex");
