import type { Request,Response } from "express";
import {prisma} from '../config/prisma.js';
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { registerLocalService } from "../services/auth.service.js";
import bcrypt from "bcryptjs";


    export const createUser = catchAsync(async (req:Request,res:Response) =>{
        const {name,email,password,roleId} = req.body;

        const result = await registerLocalService(email,password,name,roleId);

        res.status(201).json({data:result});
    })


    export const getAllUser = catchAsync(async (req:Request,res:Response) =>{
        const users = await prisma.user.findMany({
            where:{deletedAt:null}
        })

        res.status(200).json({data:users});
    })

    export const getUserById = catchAsync(async (req:Request,res:Response) =>{
        const userId = Number(req.params.userId);
        const user = await prisma.user.findFirst({
            where:{
                id:userId,
                deletedAt:null
            }
        })

        if(!user) throw new AppError("user not found",404);

        res.status(200).json({data:user})
    })

    export const updateUser = catchAsync(async (req:Request,res:Response) =>{
        const {email,name,roleId} = req.body;
        const userId = Number(req.params.userId);

        const user = await prisma.user.findFirst({
            where:{id:userId, deletedAt:null}
        });
        if(!user) throw new AppError("user not found",404);

        const updatedUser = await prisma.user.update({
            where:{id:userId},
            data:{name,email,roleId}
        })

        res.status(200).json({
            message: "User updated successfully",
            data: updatedUser
        });
    })

    export const updatePasword = catchAsync(async (req: Request, res: Response) => {
        const {password} = req.body;
        const userId = Number(req.params.userId);
        

        const provider = await prisma.authProvider.findFirst({
            where:{userId, provider:"local"}
        })
        

        if(!provider) throw new AppError("user not found",404);

        const passwordHash = await bcrypt.hash(password, 10);

        await prisma.authProvider.update({
            where:{id:provider.id},
            data:{passwordHash:passwordHash}
        })
        
        res.status(200).json({
            message: "Password updated successfully",
            
        });

    });

    export const deleteUserById = catchAsync(async (req:Request,res:Response) =>{
        const userId = Number(req.params.userId);

        const user = await prisma.user.findFirst({
            where:{id:userId, deletedAt:null}
        })
        if(!user) throw new AppError("user not found",404);

        await prisma.user.update({
            where:{id:userId},
            data:{deletedAt: new Date()}
        })

        res.status(200).json({
            message: "User deleted successfully"
        });


    })

    export const getUserByEmail = catchAsync(async (req:Request,res:Response) =>{
        const email = req.params.email as string;

        const user = await prisma.user.findFirst({
            where:{email, deletedAt:null}
        })

        if(!user) throw new AppError("user not found",404);

        res.status(200).json({
            data: user
        });
    })
