import { catchAsync } from "../utils/catchAsync.js";
import type { Request,Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";

    export const createCategory = catchAsync(async(req:Request,res:Response) =>{
        const {name} = req.body;

        const newCategory = await prisma.reportCategory.create({
            data:{name}
        })

        res.status(201).json({
            message: "category created",
            data: newCategory
        });
    })

    export const getAllCategory = catchAsync(async(req:Request,res:Response) =>{
        const categories = await prisma.reportCategory.findMany({
            where:{deletedAt:null}
        }) 

        res.status(200).json({ data: categories });
    })
    
    export const getCategoryById = catchAsync(async(req:Request,res:Response) =>{
        const categoryId = Number(req.params.categoryId);

        const category = await prisma.reportCategory.findFirst({
            where:{id:categoryId,deletedAt:null}
        })

        if (!category) throw new AppError("Category not found", 404);

    
        res.status(200).json({ data: category });
        
    })

    export const updateCategory = catchAsync(async(req:Request,res:Response) =>{
        const categoryId = Number(req.params.categoryId);
        const {name} = req.body;

        const category = await prisma.reportCategory.findFirst({
            where:{id:categoryId,deletedAt:null}
        })

        if (!category) throw new AppError("Category not found", 404);

        const updatedCategory = await prisma.reportCategory.update({
            where:{id:categoryId, deletedAt:null},
            data:{name}
        })

        res.status(200).json({
            message: "Category updated successfully",
            data: updatedCategory
        });
    })

    export const deleteCategoryById = catchAsync(async(req:Request,res:Response) =>{
        const categoryId = Number(req.params.categoryId);

        const category = await prisma.reportCategory.findFirst({
            where:{id:categoryId,deletedAt:null}
        })

        if (!category) throw new AppError("Category not found", 404);

        await prisma.reportCategory.update({
            where:{id:categoryId, deletedAt:null},
            data:{deletedAt: new Date()}
        })

        res.status(200).json({
            message: "Category deleted successfully",
        });

    })


