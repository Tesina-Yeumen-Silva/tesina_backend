import type { Response } from "express";

/**
 * Envía una respuesta HTTP de éxito estandarizada.
 * @param res Objeto Response de Express.
 * @param statusCode Código de estado HTTP (ej. 200, 201).
 * @param message Mensaje descriptivo de la operación.
 * @param data Datos útiles a retornar en la respuesta (opcional).
 * @param meta Metadatos opcionales de paginación o adicionales.
 */
export const sendResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = null,
  meta: any = null
): void => {
  res.status(statusCode).json({
    status: "success",
    message,
    data,
    ...(meta ? { meta } : {}),
  });
};
