import { z } from 'zod';

export const registerLocalSchema = z.object({
    email: z.email("El formato del correo es inválido"),
    password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
    name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
    roleId: z.coerce.number().positive().optional()
});

export const loginLocalSchema = z.object({
    email: z.email("El formato del correo es inválido"),
    password: z.string().min(1, "La contraseña es obligatoria")
});


export const tokenSchema = z.object({
    refreshToken: z.string().min(1, "El refresh token es obligatorio")
});


export type RegisterLocalDTO = z.infer<typeof registerLocalSchema>;
export type LoginLocalDTO = z.infer<typeof loginLocalSchema>;
export type TokenDTO = z.infer<typeof tokenSchema>;