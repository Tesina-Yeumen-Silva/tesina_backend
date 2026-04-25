import {z} from 'zod';

const roleSchema = z.object({
    name: z.string().min(2,"El nombre debe tener al menos 2 caracteres")
})

export const createRoleSchema = roleSchema;
export const updateRoleSchema = roleSchema.partial();

export type CreateRoleDTO = z.infer<typeof createRoleSchema>;
export type UpdateRoleDTO = z.infer<typeof updateRoleSchema>;