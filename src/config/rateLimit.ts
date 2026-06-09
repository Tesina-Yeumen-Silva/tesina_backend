import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Limite de peticiones alcanzado",
      message: "Demasiados intentos. Esperá 1 minuto.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
});

export const apiLimiter = rateLimit({
  windowMs: 1 * 1000,
  limit: 10,
  keyGenerator: (req) =>
    (req as Request).user?.userId?.toString() ?? req.ip ?? "unknown",
  validate: {
    keyGeneratorIpFallback: false,
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Limite de peticiones alcanzado",
      message: "Demasiados intentos. Esperá 1 segundo.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
});

export const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 100,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Limite de peticiones alcanzado",
      message: "Demasiados intentos. Esperá 1 minuto.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
});
