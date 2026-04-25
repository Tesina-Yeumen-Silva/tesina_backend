import type { Request, Response, NextFunction } from "express";
import { ZodError, ZodType } from "zod";
import type { ParamsDictionary } from "express-serve-static-core";
import type { ParsedQs } from "qs";

type RequestField = "body" | "params" | "query";

const validate =
  (field: RequestField, schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[field]);
      if (field === "params") {
        req.params = parsed as ParamsDictionary;
      } else if (field === "query") {
        Object.defineProperty(req, 'query', {
            value: parsed as ParsedQs,
            writable: true,
            enumerable: true,
            configurable: true
        });
      } else {
        req.body = parsed;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Error de validación",
          errors: error.issues.map((e) => ({
            campo: e.path.join(".") || "root",
            error: e.message,
          })),
        });
      }
      next(error);
    }
  };

export const validateBody = (schema: ZodType) => validate("body", schema);
export const validateParams = (schema: ZodType) => validate("params", schema);
export const validateQuery = (schema: ZodType) => validate("query", schema);
