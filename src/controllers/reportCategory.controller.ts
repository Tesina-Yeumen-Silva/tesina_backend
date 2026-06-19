import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import { 
  createCategoryService, 
  deleteCategoryByIdService, 
  getAllCategoryService, 
  getCategoryByIdService, 
  updateCategoryService 
} from "../services/reportCategory.services.js";
import type { CreateCategoryDTO, UpdateCategoryDTO } from "../schemas/category.schema.js";

export const createCategory = catchAsync(async (req: Request, res: Response) => {
  const data: CreateCategoryDTO = req.body;
  const newCategory = await createCategoryService(data);
  sendResponse(res, 201, "Category created successfully", newCategory);
});

export const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const categories = await getAllCategoryService();
  sendResponse(res, 200, "Categories retrieved successfully", categories);
});

export const getCategoryById = catchAsync(async (req: Request, res: Response) => {
  const categoryId = Number(req.params.categoryId);
  const category = await getCategoryByIdService(categoryId);
  sendResponse(res, 200, "Category retrieved successfully", category);
});

export const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const categoryId = Number(req.params.categoryId);
  const data: UpdateCategoryDTO = req.body;

  const updatedCategory = await updateCategoryService(categoryId, data);
  sendResponse(res, 200, "Category updated successfully", updatedCategory);
});

export const deleteCategoryById = catchAsync(async (req: Request, res: Response) => {
  const categoryId = Number(req.params.categoryId);
  await deleteCategoryByIdService(categoryId);
  sendResponse(res, 200, "Category deleted successfully");
});
