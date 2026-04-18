import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

class RoleController {
    
    getAllRole = catchAsync(async (req: Request, res: Response) => {
        const roles = await prisma.role.findMany({
            where: {
                deletedAt: null
            }
        });

        res.status(200).json({ data: roles });
    });

    getRoleById = catchAsync(async (req: Request, res: Response) => {
        const roleId = Number(req.params.roleId); 
        
        const role = await prisma.role.findFirst({
            where: { id: roleId, deletedAt: null }
        });

        if (!role) {
            throw new AppError("Role not found", 404);
        }

        res.status(200).json({ data: role });
    });

    createRole = catchAsync(async (req: Request, res: Response) => {
        const { name } = req.body;
        
        const newRole = await prisma.role.create({
            data: { name }
        });

        res.status(201).json({
            message: "Role created",
            data: newRole
        });
    });

    updateRole = catchAsync(async (req: Request, res: Response) => {
        const roleId = Number(req.params.roleId);
        const { name } = req.body;

        const existingRole = await prisma.role.findFirst({
            where: { id: roleId, deletedAt: null }
        });

        if (!existingRole) {
            throw new AppError("Role not found", 404);
        }

        const updatedRole = await prisma.role.update({
            where: { id: roleId },
            data: { name }
        });

        res.status(200).json({
            message: "Role updated successfully",
            data: updatedRole
        });
    });

    deleteRoleById = catchAsync(async (req: Request, res: Response) => {
        const roleId = Number(req.params.roleId);

        const existingRole = await prisma.role.findFirst({
            where: { id: roleId, deletedAt: null }
        });

        if (!existingRole) {
            throw new AppError("Role not found", 404);
        }

        await prisma.role.update({
            where: { id: roleId },
            data: { 
                deletedAt: new Date() 
            }
        });

        res.status(200).json({
            message: "Role deleted successfully"
        });
    });
}

export default new RoleController();