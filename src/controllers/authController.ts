import type { Request, Response } from "express";
import { registerLocal, loginLocal } from "../services/auth/auth.services.js";
import { AppError } from "../utils/appError.js";

class AuthController{
    async registerLocalController(req:Request, res:Response){
        try {
            const {email, password} = req.body;

            const result = await registerLocal(email,password);
            res.status(201).json(result);
        } catch (error) {
            if(error instanceof AppError){
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(500).json({message:"Server error"})
        }
    }

    async loginLocalController(req:Request, res:Response){
        try {
            const {email, password} = req.body;

            const result = await loginLocal(email,password);
            res.status(200).json(result);
        } catch (error) {
            if(error instanceof AppError){
                res.status(error.statusCode).json({ message: error.message });
                return;
            }
            res.status(500).json({message:"Server error"})
        }
    }
}

export default new AuthController();