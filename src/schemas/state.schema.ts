import {z} from 'zod';

const StateSchema = z.object({
    name: z.string().min(2,"El nombre debe tener al menos 2 caracteres"),
    color: z.string()
})

export const createStateSchema = StateSchema;
export const updateStateSchema = StateSchema.partial();

export type CreateStateDTO = z.infer<typeof createStateSchema>;
export type UpdateStateDTO = z.infer<typeof updateStateSchema>;