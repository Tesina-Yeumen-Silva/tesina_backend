import { z } from 'zod';

export const generateIdSchema = (paramName: string) => {
    return z.object({
        [paramName]: z.coerce.number().positive(`El parámetro ${paramName} es inválido`)
    });
};