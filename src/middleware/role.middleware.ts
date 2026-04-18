import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

export function authorizeRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        
        if (!req.user) {
            return next(new AppError("Not authenticated", 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(new AppError("Don't have permissions", 403));
        }

        next();
    };
}