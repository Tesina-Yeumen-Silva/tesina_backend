import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "../utils/appError.js";

export function authorizeRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
        
        if (!req.user) {
            return next(new UnauthorizedError("Not authenticated"));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError("Don't have permissions"));
        }

        next();
    };
}