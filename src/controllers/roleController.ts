import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";

class RoleController {
    
    getAllRole = async (req: Request, res: Response) => {
        try {
            const roles = await prisma.role.findMany({
                where:{
                    deletedAt: null
                }
            });

            res.status(200).json({ data: roles });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }

    getRoleById = async (req: Request, res: Response) => {
        try {
            const roleId = req.params.roleId as string; 
            
            const role = await prisma.role.findUnique({
                where: { id: Number(roleId), deletedAt:null }
            });

            if (!role) {
                return res.status(404).json({ message: "Role not found" });
            }

            res.status(200).json({ data: role });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }

    createRole = async (req: Request, res: Response) => {
        try {
            const { name } = req.body;
            
            const newRole = await prisma.role.create({
                data: {
                    name
                }
            });

            res.status(201).json({
                message: "Role created",
                data: newRole
            });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }

    updateRole = async (req: Request, res: Response) => {
        try {
            const roleId = req.params.roleId as string;
            const { name } = req.body;

            const existingRole = await prisma.role.findUnique({
                where: { id: Number(roleId), deletedAt:null }
            });

            if (!existingRole) {
                return res.status(404).json({ message: "Role not found" });
            }

            const updatedRole = await prisma.role.update({
                where: { id: Number(roleId) },
                data: { name }
            });

            res.status(200).json({
                message: "Role updated successfully",
                data: updatedRole
            });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }

    deleteRoleById = async (req: Request, res: Response) => {
        try {
            const roleId = req.params.roleId as string;

            const existingRole = await prisma.role.findUnique({
                where: { id: Number(roleId), deletedAt:null }
            });

            if (!existingRole) {
                return res.status(404).json({ message: "Role not found" });
            }

            await prisma.role.update({
                where: { id: Number(roleId) },
                data: { 
                    deletedAt: new Date() 
                }
            });

            res.status(200).json({
                message: "Role deleted successfully"
            });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    }
}

export default new RoleController();