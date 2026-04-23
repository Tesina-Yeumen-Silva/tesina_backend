import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { registerLocalService } from "../services/auth.service.js";
import { deleteUserByIdService, getAllUsersService, getUserByEmailService, getUserByIdService, updatedUserService, updatePasswordService } from "../services/user.services.js";
import type{ CreateUserDTO, UpdateUserDTO, UpdatePasswordDTO } from "../schemas/user.schema.js";

export const createUser = catchAsync(async (req: Request, res: Response) => {
    const data: CreateUserDTO = req.body;
    const result = await registerLocalService(data);
    res.status(201).json({ data: result });
});

export const getAllUser = catchAsync(async (req: Request, res: Response) => {
    const users = await getAllUsersService();
    res.status(200).json({ data: users });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
    const userId  = Number(req.params.userId);
    const user = await getUserByIdService(userId);
    res.status(200).json({ data: user });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
    const userId  = Number(req.params.userId);
    const data: UpdateUserDTO = req.body;

    const updatedUser = await updatedUserService(userId, data);
    res.status(200).json({
        message: "User updated successfully",
        data: updatedUser
    });
});

export const updatePassword = catchAsync(async (req: Request, res: Response) => {
    const userId  = Number(req.params.userId);
    const data: UpdatePasswordDTO = req.body;

    await updatePasswordService(userId, data);
    res.status(200).json({ message: "Password updated successfully" });
});

export const deleteUserById = catchAsync(async (req: Request, res: Response) => {
    const userId  = Number(req.params.userId);
    await deleteUserByIdService(userId);
    res.status(200).json({ message: "User deleted successfully" });
});

export const getUserByEmail = catchAsync(async (req: Request, res: Response) => {
    const email = req.params.email as string;
    const user = await getUserByEmailService(email);
    res.status(200).json({ data: user });
});