import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";



export const createCategoryService = async(name:string) =>{

        const newCategory = await prisma.reportCategory.create({
            data:{name}
        })

        return newCategory;
    }

    export const getAllCategoryService = async() =>{
        const categories = await prisma.reportCategory.findMany({
            where:{deletedAt:null}
        }) 

        return categories;
    }
    
    export const getCategoryByIdService = async(categoryId:number) =>{
        

        const category = await prisma.reportCategory.findFirst({
            where:{id:categoryId,deletedAt:null}
        })

        if (!category) throw new AppError("Category not found", 404);

    
        return category;
        
    }

    export const updateCategoryService = async(categoryId:number,name:string) =>{
        

        const category = await prisma.reportCategory.findFirst({
            where:{id:categoryId,deletedAt:null}
        })

        if (!category) throw new AppError("Category not found", 404);

        const updatedCategory = await prisma.reportCategory.update({
            where:{id:categoryId, deletedAt:null},
            data:{name}
        })

        return updatedCategory;
    }

    export const deleteCategoryByIdService = async(categoryId:number) =>{

        const category = await prisma.reportCategory.findFirst({
            where:{id:categoryId,deletedAt:null}
        })

        if (!category) throw new AppError("Category not found", 404);

        await prisma.reportCategory.update({
            where:{id:categoryId, deletedAt:null},
            data:{deletedAt: new Date()}
        })

       

    }