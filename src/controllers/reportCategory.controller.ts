import { catchAsync } from "../utils/catchAsync.js";
import type { Request,Response } from "express";
import { createCategoryService, deleteCategoryByIdService, getAllCategoryService, getCategoryByIdService, updateCategoryService } from "../services/reportCategory.services.js";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "../schemas/category.schema.js";

    export const createCategory = catchAsync(async(req:Request,res:Response) =>{
        const data:CreateCategoryDTO = req.body;

        const newCategory = await createCategoryService(data)

        res.status(201).json({
            message: "category created",
            data: newCategory
        });
    })

    export const getAllCategory = catchAsync(async(req:Request,res:Response) =>{
        const categories = await getAllCategoryService()

        res.status(200).json({ data: categories });
    })
    
    export const getCategoryById = catchAsync(async(req:Request,res:Response) =>{
        const categoryId = Number(req.params.categoryId);

        const category = await getCategoryByIdService(categoryId)

    
        res.status(200).json({ data: category });
        
    })

    export const updateCategory = catchAsync(async(req:Request,res:Response) =>{
        const categoryId = Number(req.params.categoryId);
        const data: UpdateCategoryDTO = req.body;



        const updatedCategory = await updateCategoryService(categoryId,data)

        res.status(200).json({
            message: "Category updated successfully",
            data: updatedCategory
        });
    })

    export const deleteCategoryById = catchAsync(async(req:Request,res:Response) =>{
        const categoryId = Number(req.params.categoryId);

        await deleteCategoryByIdService(categoryId)

        res.status(200).json({
            message: "Category deleted successfully",
        });

    })


