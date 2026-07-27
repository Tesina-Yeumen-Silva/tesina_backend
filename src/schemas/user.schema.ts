import { z } from "zod";

export const userSchema = z.object({
  id: z.coerce.number().positive(),
  email: z.email("Formato de correo inválido"),
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  roleId: z.coerce.number().positive("El ID del rol es inválido"),
});

export const createUserSchema = userSchema.omit({ id: true });
export const updateUserSchema = userSchema
  .omit({ id: true, password: true })
  .partial();
export const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
});

export const emailParamSchema = z.object({
  email: z.email("El formato de correo para la búsqueda es inválido"),
});

export const registerPushTokenSchema = z.object({
  token: z.string().min(1, "El token de notificación es requerido"),
});

export type RegisterPushTokenDTO = z.infer<typeof registerPushTokenSchema>;

export type CreateUserDTO = z.infer<typeof createUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UpdatePasswordDTO = z.infer<typeof updatePasswordSchema>;

export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().min(1).optional(),
  role: z
    .union([z.string(), z.array(z.string())])
    .transform((val) => (Array.isArray(val) ? val : [val]))
    .optional(),
});

export type GetUsersQueryDTO = z.infer<typeof getUsersQuerySchema>;
