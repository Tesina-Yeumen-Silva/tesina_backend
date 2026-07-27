import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import {
  createUserService,
  deleteUserByIdService,
  getAllUsersService,
  getUserByEmailService,
  getUserByIdService,
  savePushTokenService,
  updatedUserService,
  updatePasswordService,
} from "../services/user.services.js";
import {
  getUsersQuerySchema,
  type CreateUserDTO,
  type UpdateUserDTO,
  type UpdatePasswordDTO,
  type GetUsersQueryDTO,
} from "../schemas/user.schema.js";

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const data: CreateUserDTO = req.body;
  const result = await createUserService(data);
  sendResponse(res, 201, "User created successfully", result);
});

export const registerPushToken = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const { token } = req.body;

    const result = await savePushTokenService(userId, token);
    sendResponse(res, 201, "Push token registered successfully", result);
  },
);

export const getAllUser = catchAsync(async (req: Request, res: Response) => {
  const queryData = getUsersQuerySchema.parse(req.query);
  const result = await getAllUsersService(queryData, req.user?.role);
  sendResponse(res, 200, "Users retrieved successfully", result.users, {
    currentPage: result.page,
    totalPages: Math.ceil(result.totalUsers / result.limit),
    totalItems: result.totalUsers,
  });
});

export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const user = await getUserByIdService(userId);
  sendResponse(res, 200, "User retrieved successfully", user);
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const userId = Number(req.params.userId);
  const data: UpdateUserDTO = req.body;

  const updatedUser = await updatedUserService(userId, data, req.user?.role);
  sendResponse(res, 200, "User updated successfully", updatedUser);
});

export const updatePassword = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    const data: UpdatePasswordDTO = req.body;

    await updatePasswordService(userId, data, req.user?.role);
    sendResponse(res, 200, "Password updated successfully");
  },
);

export const deleteUserById = catchAsync(
  async (req: Request, res: Response) => {
    const userId = Number(req.params.userId);
    await deleteUserByIdService(userId, req.user?.role);
    sendResponse(res, 200, "User deleted successfully");
  },
);

export const getUserByEmail = catchAsync(
  async (req: Request, res: Response) => {
    const email = req.params.email as string;
    const user = await getUserByEmailService(email);
    sendResponse(res, 200, "User retrieved successfully", user);
  },
);
