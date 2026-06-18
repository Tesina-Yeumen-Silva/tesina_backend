import { Prisma } from "@prisma/client";
import {
  AppError,
  ConflictError,
  NotFoundError,
  BadRequestError,
} from "./appError.js";

export function handlePrismaError(err: any): Error {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        const targets = (err.meta?.target as string[]) || [];
        const fields = targets.map((t) => t.split("_").pop()).join(", ");
        return new ConflictError(
          `Ya existe un registro con los mismos datos en los campos: [${fields || "claves únicas"}]`,
        );
      }
      case "P2025": {
        const cause =
          (err.meta?.cause as string) ||
          "El registro solicitado no fue encontrado";
        return new NotFoundError(cause);
      }
      case "P2003": {
        const fieldName =
          (err.meta?.field_name as string) || "relación externa";
        return new BadRequestError(
          `Error de integridad: El registro referenciado en '${fieldName}' no existe o está en uso.`,
        );
      }
      case "P2000": {
        return new BadRequestError(
          "El valor ingresado es demasiado largo para la columna de la base de datos.",
        );
      }
      default:
        return new BadRequestError(
          `Error en la operación de base de datos (Código: ${err.code})`,
        );
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    return new BadRequestError(
      "La estructura de los datos provistos para la base de datos no es correcta.",
    );
  }

  if (err instanceof Prisma.PrismaClientInitializationError) {
    return new AppError(
      "Error de inicialización de conexión a la base de datos.",
      500,
      false,
    );
  }

  return err;
}
