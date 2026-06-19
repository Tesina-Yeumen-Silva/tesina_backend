import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import {
  createRoleService,
  deleteRoleByIdService,
  getAllRoleService,
  getRoleByIdService,
  updateRoleService,
} from "../services/role.services.js";
import type { CreateRoleDTO, UpdateRoleDTO } from "../schemas/role.schema.js";

export const getAllRole = catchAsync(async (req: Request, res: Response) => {
  const roles = await getAllRoleService();
  sendResponse(res, 200, "Roles retrieved successfully", roles);
});

export const getRoleById = catchAsync(async (req: Request, res: Response) => {
  const roleId = Number(req.params.roleId);
  const role = await getRoleByIdService(roleId);
  sendResponse(res, 200, "Role retrieved successfully", role);
});

export const createRole = catchAsync(async (req: Request, res: Response) => {
  const roleData: CreateRoleDTO = req.body;
  const newRole = await createRoleService(roleData);
  sendResponse(res, 201, "Role created successfully", newRole);
});

export const updateRole = catchAsync(async (req: Request, res: Response) => {
  const roleId = Number(req.params.roleId);
  const roleData: UpdateRoleDTO = req.body;

  const updatedRole = await updateRoleService(roleId, roleData);
  sendResponse(res, 200, "Role updated successfully", updatedRole);
});

export const deleteRoleById = catchAsync(async (req: Request, res: Response) => {
  const roleId = Number(req.params.roleId);
  await deleteRoleByIdService(roleId);
  sendResponse(res, 200, "Role deleted successfully");
});
