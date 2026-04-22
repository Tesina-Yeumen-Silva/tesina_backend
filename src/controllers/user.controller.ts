import type { Request,Response } from "express";
import {prisma} from '../config/prisma.js';
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { registerLocalService } from "../services/auth.service.js";
import { deleteUserByIdService, getAllUsersService, getUserByEmailService, getUserByIdService, updatedUserService, updatePaswordService } from "../services/user.services.js";


    export const createUser = catchAsync(async (req:Request,res:Response) =>{
        const {name,email,password,roleId} = req.body;

        const result = await registerLocalService(email,password,name,roleId);

        res.status(201).json({data:result});
    })


    export const getAllUser = catchAsync(async (req:Request,res:Response) =>{
        const users = await getAllUsersService();

        res.status(200).json({
            data: users
        });
    })

    export const getUserById = catchAsync(async (req:Request,res:Response) =>{
        const userId = Number(req.params.userId);
        
        const user = await getUserByIdService(userId)

        res.status(200).json({data:user})
    })

    export const updateUser = catchAsync(async (req:Request,res:Response) =>{
        const {email,name,roleId} = req.body;
        const userId = Number(req.params.userId);

        const updatedUser = await updatedUserService(email,name,roleId,userId)

        res.status(200).json({
            message: "User updated successfully",
            data: updatedUser
        });
    })

    export const updatePasword = catchAsync(async (req: Request, res: Response) => {
        const {password} = req.body;
        const userId = Number(req.params.userId);
        

        await updatePaswordService(password,userId)
        
        res.status(200).json({
            message: "Password updated successfully",
        });

    });

    export const deleteUserById = catchAsync(async (req:Request,res:Response) =>{
        const userId = Number(req.params.userId);

        await deleteUserByIdService(userId)

        res.status(200).json({
            message: "User deleted successfully"
        });


    })

    export const getUserByEmail = catchAsync(async (req:Request,res:Response) =>{
        const email = req.params.email as string;


        const user = await getUserByEmailService(email)
        
        res.status(200).json({
            data: user
        });
    })
