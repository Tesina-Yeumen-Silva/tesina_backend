import { z } from "zod";

export const registerLocalSchema = z.object({
  email: z.email("El formato del correo es inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  roleId: z.coerce.number().positive().optional(),
});

export const loginLocalSchema = z.object({
  email: z.email("El formato del correo es inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

export const tokenSchema = z.object({
  refreshToken: z.string().min(1, "El refresh token es obligatorio"),
});

export const requestPasswordResetSchema = z.object({
  email: z.email("El formato del correo es inválido"),
});

export const confirmPasswordResetSchema = z.object({
  email: z.email("El formato del correo es inválido"),
  code: z.string().min(1, "El código es obligatorio"),
  newPassword: z.string().min(1, "La contraseña es obligatoria"),
});

export type RegisterLocalDTO = z.infer<typeof registerLocalSchema>;
export type LoginLocalDTO = z.infer<typeof loginLocalSchema>;
export type TokenDTO = z.infer<typeof tokenSchema>;
export type RequestPasswordResetDTO = z.infer<
  typeof requestPasswordResetSchema
>;
export type confirmPasswordResetDTO = z.infer<
  typeof confirmPasswordResetSchema
>;
