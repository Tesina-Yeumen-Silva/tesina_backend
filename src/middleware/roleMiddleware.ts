import type { Request,Response, NextFunction } from "express";
import { AppError } from "../utils/appError.js";

export function authorizeRole(...roles: string[]){
    return(req:Request,res:Response,next:NextFunction) => {
        if(!req.user){
            throw new AppError("No authenticated",401)
        }

        if(!roles.includes(req.user.role)){
            res.status(403).json({ message: "Don't have permissions" });
            return;
        }

        next();
    }
}