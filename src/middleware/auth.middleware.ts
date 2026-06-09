import type { Request,Response,NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { AppError, UnauthorizedError, ForbiddenError } from "../utils/appError.js";
import { verifyToken } from "../utils/jwt.js";
import type { JwtPayload } from "../types/auth.js";



export function authenticateJwt(req:Request,res:Response,next:NextFunction){
    try {
        const authheader = req.headers.authorization;

        if(!authheader || !authheader.startsWith("Bearer")){
            throw new UnauthorizedError("Token needed");
        }

        const token = authheader.split(" ")[1];

        if (!token) {
            throw new UnauthorizedError("Token needed");
        }
        const payload = verifyToken(token);

        req.user = payload;
        next();
    } catch (error) {
        next(error);
    }
}

export const restrictTo = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return next(new ForbiddenError("No tienes permisos suficientes para realizar esta acción"));
        }

        next();
    };
};