import crypto from "crypto";

/**
 * Genera un código numérico aleatorio para verificación de longitud variable.
 */
export function generateVerificationCode(length: number = 6): string {
  const max = Math.pow(10, length);
  const randomNumber = crypto.randomInt(0, max);
  return randomNumber.toString().padStart(length, "0");
}

/**
 * Encripta un texto usando cifrado simétrico AES-256-CBC y una clave secreta.
 * Retorna el IV y el texto cifrado en formato "iv_hex:encrypted_hex".
 */
export function encrypt(text: string, secret: string): string {
  const iv = crypto.randomBytes(16);
  // Derivamos una clave de 32 bytes usando SHA-256 a partir del secret
  const key = crypto.createHash("sha256").update(secret).digest();
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(Buffer.from(text, "utf8")),
    cipher.final()
  ]);
  
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

/**
 * Desencripta un texto cifrado en formato "iv_hex:encrypted_hex" usando AES-256-CBC.
 */
export function decrypt(text: string, secret: string): string {
  const parts = text.split(":");
  const ivHex = parts.shift();
  if (!ivHex) throw new Error("Missing IV in encrypted string");
  
  const iv = Buffer.from(ivHex, "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  
  // Derivamos la misma clave de 32 bytes
  const key = crypto.createHash("sha256").update(secret).digest();
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final()
  ]);
  
  return decrypted.toString("utf8");
}
