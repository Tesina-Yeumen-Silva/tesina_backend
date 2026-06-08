import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, ValidationError } from "../utils/appError.js";
import { handlePrismaError } from "../utils/prismaErrors.js";
import { logger } from "../utils/logger.js";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  let error = err;

  // 1. Mapear errores de JWT
  if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
    error = new AppError("Token inválido o expirado", 401);
  }

  // 2. Mapear errores de validación de Zod
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((issue) => ({
      campo: issue.path.join(".") || "root",
      error: issue.message,
    }));
    error = new ValidationError("Error de validación", formattedErrors);
  }

  // 3. Mapear errores de Prisma (base de datos)
  if (err.name && err.name.startsWith("PrismaClient")) {
    error = handlePrismaError(err);
  }

  const isProduction = process.env.NODE_ENV === "production";

  // 4. Procesar errores operacionales (controlados) vs no operacionales (bugs)
  if (error instanceof AppError && error.isOperational) {
    logger.warn(`Operational Error (${error.statusCode}): ${error.message}`, {
      path: req.originalUrl,
      method: req.method,
      errors: error.errors,
    });

    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      ...(error.errors ? { errors: error.errors } : {}),
    });
    return;
  }

  // 5. Error no controlado (Fallo de servidor / Bug)
  logger.error(
    `Unhandled Exception at ${req.method} ${req.originalUrl}:`,
    error,
  );

  if (!isProduction) {
    res.status(500).json({
      status: "error",
      message: error.message || "Error interno del servidor",
      stack: error.stack,
      error: error,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Error interno del servidor",
    });
  }
};
