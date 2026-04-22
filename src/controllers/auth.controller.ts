import type { Request, Response } from "express";
import { registerLocalService, loginLocalService, refreshAccessTokenService, logoutService } from "../services/auth.service.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

    export const registerLocal = catchAsync(async (req: Request, res: Response) => {
        const { email, password, name } = req.body;
        const result = await registerLocal(email, password, name);
        res.status(201).json(result);
    });

    export const loginLocal = catchAsync(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await loginLocalService(email, password);
        res.status(200).json(result);
    });

    export const refreshToken = catchAsync(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new AppError("Refresh token required", 400); 
        }

        const result = await refreshAccessTokenService(refreshToken);
        res.status(200).json(result);
    });

    export const logout = catchAsync(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new AppError("Refresh token required", 400);
        }

        await logoutService(refreshToken);
        res.status(200).json({ message: "Session closed successfully" });
    });

    export const googleCallback = (req: Request, res: Response) => {
        const { token, refreshToken } = req.user as any; 

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        
        res.redirect(`${frontendUrl}?accessToken=${token}&refreshToken=${refreshToken}`);
    };

    export const googleFailed = (req: Request, res: Response) => {
        res.status(401).json({ message: "Error authenticating with Google" });
    };
