import { z } from 'zod';

export const reportSchema = z.object({
    id: z.coerce.number().positive(),
    address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
    description: z.string(), 
    imageUrl: z.string(),
    isAnonymous: z.coerce.boolean(),
    userId: z.coerce.number().positive("El ID de usuario es inválido"),
    categoryId: z.coerce.number(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    deletedAt: z.date().optional(),
});

export const getReportQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    minLat: z.coerce.number().optional(),
    maxLat: z.coerce.number().optional(),
    minLng: z.coerce.number().optional(),
    maxLng: z.coerce.number().optional()
})

export type GetReportsQueryDTO = z.infer<typeof getReportQuerySchema>;


export const createReportSchema = reportSchema.omit({
    id: true,
    imageUrl: true,
    createdAt: true,
    updatedAt: true,
    deletedAt:true
});


export const updateReportSchema = createReportSchema.partial();

interface MulterFields {
    originalBuffer: Buffer;
    mimetype: string;
}

export type ReportBaseDTO = z.infer<typeof reportSchema>;
export type CreateReportDTO = z.infer<typeof createReportSchema> & MulterFields;
export type UpdateReportDTO = z.infer<typeof updateReportSchema> & Partial<MulterFields>;