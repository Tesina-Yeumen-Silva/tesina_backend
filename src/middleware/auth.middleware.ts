import type { Request,Response,NextFunction } from "express";
import jwt from 'jsonwebtoken'
import { AppError } from "../utils/appError.js";
import { verifyToken } from "../utils/jwt.js";

export interface JwtPayload {
    userId: number;
    email:string;
    role: string;
}



export function authenticateJwt(req:Request,res:Response,next:NextFunction){
    try {
        const authheader = req.headers.authorization;

        if(!authheader || !authheader.startsWith("Bearer")){
            throw new AppError("Token needed", 401);
        }

        const token = authheader.split(" ")[1];

        if (!token) {
            throw new AppError("Token needed", 401);
        }
        const payload = verifyToken(token);

        req.user = payload;
        next();
    } catch (error) {
        if(error instanceof AppError){
            res.status(error.statusCode).json({ message: error.message });
            return;
        }
            res.status(401).json({ message: "Invalid or expired token" });
    }
}

export const restrictTo = (...allowedRoles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const userRole = req.user?.role;

        if (!userRole || !allowedRoles.includes(userRole)) {
            return next(new AppError("No tienes permisos suficientes para realizar esta acción", 403));
        }

        next();
    };
};