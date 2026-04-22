import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js"
import { AppError } from "../utils/appError.js";


export const getAllUsersService = async() =>{
    const users = await prisma.user.findMany({
        where:{deletedAt:null},
        select:{
            id:true,
            email:true,
            name:true,
            roleId:true,
            createdAt:true,
        },
    })

    return users;
}

export const getUserByIdService = async(userId:number) => {
    const user = await prisma.user.findFirst({
        where:{id:userId, deletedAt:null},
        select:{
            id:true,
            email:true,
            name:true,
            roleId:true,
            createdAt:true,
        },
    })
    
    if(!user) throw new AppError("user not found",404);

    return user;
}

export const updatedUserService = async(email:string,name:string,roleId:number,userId:number) => {
    const user = await prisma.user.findFirst({
            where:{id:userId, deletedAt:null}
        });
    if(!user) throw new AppError("user not found",404);

    const updatedUser = await prisma.user.update({
        where:{id:userId},
        data:{name,email,roleId}
    })

    return updatedUser
} 

export const updatePaswordService = async (password:string,userId:number) => {
    const provider = await prisma.authProvider.findFirst({
        where:{userId, provider:"local"}
    })

    if(!provider) throw new AppError("user not found",404);
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    await prisma.authProvider.update({
        where:{id:provider.id},
        data:{passwordHash:passwordHash}
    })
}

export const deleteUserByIdService = async(userId:number) => {
    const user = await prisma.user.findFirst({
        where:{id:userId, deletedAt:null}
    })
    if(!user) throw new AppError("user not found",404);

    await prisma.user.update({
        where:{id:userId},
        data:{deletedAt: new Date()}
    })
}

export const getUserByEmailService = async(email:string) => {
    const user = await prisma.user.findFirst({
        where:{email, deletedAt:null}
    })

    if(!user) throw new AppError("user not found",404);

    return user;
}