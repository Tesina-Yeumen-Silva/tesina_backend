import { z } from "zod";

export const reportSchema = z.object({
  id: z.coerce.number().positive(),
  address: z.string().min(5, "La dirección debe tener al menos 5 caracteres"),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres").max(2000, "La descripción no puede superar los 2000 caracteres"),
  imageUrl: z.string(),
  isAnonymous: z.preprocess(
    (val) => val === "true" || val === true, 
    z.boolean()
  ),
  categoryId: z.coerce.number(),
});

const parseIdList = (val: unknown) => {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val === "number") return [val];
  if (typeof val === "string") {
    const list = val
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
    return list.length > 0 ? list : undefined;
  }
  if (Array.isArray(val)) {
    const list = val.map(Number).filter((n) => !isNaN(n) && n > 0);
    return list.length > 0 ? list : undefined;
  }
  return undefined;
};

export const getReportQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  minLat: z.coerce.number().optional(),
  maxLat: z.coerce.number().optional(),
  minLng: z.coerce.number().optional(),
  maxLng: z.coerce.number().optional(),
  categoryId: z.preprocess(parseIdList, z.array(z.number()).optional()),
  stateId: z.preprocess(parseIdList, z.array(z.number()).optional()),
  search: z.string().optional(),
  sortBy: z.enum(["date", "adhesions", "createdAt"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const createReportSchema = reportSchema.omit({
  id: true,
  imageUrl: true,
});

export const updateReportSchema = createReportSchema.partial();

export const changeStateSchema = z.object({
  stateId: z.coerce.number().positive("El ID del estado es inválido"),
  observation: z.string().optional(),
});

interface MulterFields {
  originalBuffer: Buffer;
  mimetype: string;
}

export type ReportBaseDTO = z.infer<typeof reportSchema>;
export type CreateReportDTO = z.infer<typeof createReportSchema> & MulterFields;
export type UpdateReportDTO = z.infer<typeof updateReportSchema> &
  Partial<MulterFields>;
export type GetReportsQueryDTO = z.infer<typeof getReportQuerySchema>;
export type ChangeStateDTO = z.infer<typeof changeStateSchema>;
