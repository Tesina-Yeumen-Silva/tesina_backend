import crypto from "crypto";

export function generateVerificationCode(length: number = 6): string {
  const max = Math.pow(10, length);
  const randomNumber = crypto.randomInt(0, max);
  return randomNumber.toString().padStart(length, "0");
}
