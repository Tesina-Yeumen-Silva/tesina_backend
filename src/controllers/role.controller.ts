import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { createRoleService, deleteRoleByIdService, getAllRoleService, getRoleByIdService, updateRoleService } from "../services/role.services.js";

    export const getAllRole = catchAsync(async (req: Request, res: Response) => {
        const roles = await getAllRoleService()

        res.status(200).json({ data: roles });
    });

    export const getRoleById = catchAsync(async (req: Request, res: Response) => {
        const roleId = Number(req.params.roleId); 
        
        const role = await getRoleByIdService(roleId)

        res.status(200).json({ data: role });
    });

    export const createRole = catchAsync(async (req: Request, res: Response) => {
        const { name } = req.body;
        
        const newRole = await createRoleService(name)

        res.status(201).json({
            message: "Role created",
            data: newRole
        });
    });

    export const updateRole = catchAsync(async (req: Request, res: Response) => {
        const roleId = Number(req.params.roleId);
        const { name } = req.body;

        const updatedRole = await updateRoleService(roleId,name)

        res.status(200).json({
            message: "Role updated successfully",
            data: updatedRole
        });
    });

    export const deleteRoleById = catchAsync(async (req: Request, res: Response) => {
        const roleId = Number(req.params.roleId);

        await deleteRoleByIdService(roleId)

        res.status(200).json({
            message: "Role deleted successfully"
        });
    });
