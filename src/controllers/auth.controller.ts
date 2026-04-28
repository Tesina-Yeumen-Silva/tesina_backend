import type { Request, Response } from "express";
import { registerLocalService, loginLocalService, refreshAccessTokenService, logoutService, requestPasswordResetService, confirmPasswordResetService } from "../services/auth.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import type { RegisterLocalDTO,LoginLocalDTO,TokenDTO, RequestPasswordResetDTO, confirmPasswordResetDTO } from "../schemas/auth.schema.js";

export const registerLocal = catchAsync(async (req: Request, res: Response) => {
    const data: RegisterLocalDTO = req.body;
    const result = await registerLocalService(data);
    res.status(201).json(result);
});

export const loginLocal = catchAsync(async (req: Request, res: Response) => {
    const data: LoginLocalDTO = req.body;
    const result = await loginLocalService(data);
    res.status(200).json(result);
});

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
    const data: TokenDTO = req.body; 
    const result = await refreshAccessTokenService(data.refreshToken);
    res.status(200).json(result);
});

export const logout = catchAsync(async (req: Request, res: Response) => {
    const data: TokenDTO = req.body;
    await logoutService(data.refreshToken);
    res.status(200).json({ message: "Session closed successfully" });
});

export const requestPasswordReset = catchAsync(async (req: Request, res: Response) => {
    const data : RequestPasswordResetDTO = req.body;
    await requestPasswordResetService(data);
    res.status(200).json({
        message:"Email sended successfully"
    })
})

export const confirmPasswordReset = catchAsync(async (req: Request, res: Response) => {
    const data : confirmPasswordResetDTO = req.body;
    await confirmPasswordResetService(data);
    res.status(200).json({
        message:"Password updated successfully"
    })
})

export const googleCallback = (req: Request, res: Response) => {
    const { token, refreshToken } = req.user as any; 
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    res.redirect(`${frontendUrl}?accessToken=${token}&refreshToken=${refreshToken}`);
};

export const googleFailed = (req: Request, res: Response) => {
    res.status(401).json({ message: "Error authenticating with Google" });
};