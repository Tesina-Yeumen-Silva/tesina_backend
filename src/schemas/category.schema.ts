import {z} from 'zod';

const categorySchema = z.object({
    name: z.string().min(2,"El nombre debe tener al menos 2 caracteres")
})

export const createCategorySchema = categorySchema;
export const updateCategorySchema = categorySchema.partial();

export type CreateCategoryDTO = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDTO = z.infer<typeof updateCategorySchema>;