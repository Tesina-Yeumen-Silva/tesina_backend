import type { Request, Response } from "express";
import { registerLocal, loginLocal, refreshAccessToken, logout } from "../services/auth/authServices.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

class AuthController {
    registerLocalController = catchAsync(async (req: Request, res: Response) => {
        const { email, password, name } = req.body;
        const result = await registerLocal(email, password, name);
        res.status(201).json(result);
    });

    loginLocalController = catchAsync(async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const result = await loginLocal(email, password);
        res.status(200).json(result);
    });

    refreshTokenController = catchAsync(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new AppError("Refresh token required", 400); 
        }

        const result = await refreshAccessToken(refreshToken);
        res.status(200).json(result);
    });

    logoutController = catchAsync(async (req: Request, res: Response) => {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new AppError("Refresh token required", 400);
        }

        await logout(refreshToken);
        res.status(200).json({ message: "Session closed successfully" });
    });

    googleCallbackController = (req: Request, res: Response) => {
        const { token, refreshToken } = req.user as any; 

        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        
        res.redirect(`${frontendUrl}?accessToken=${token}&refreshToken=${refreshToken}`);
    };

    googleFailedController = (req: Request, res: Response) => {
        res.status(401).json({ message: "Error authenticating with Google" });
    };
}

export default new AuthController();