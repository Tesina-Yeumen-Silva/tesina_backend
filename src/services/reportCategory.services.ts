import { prisma } from "../config/prisma.js";
import type {
  CreateCategoryDTO,
  UpdateCategoryDTO,
} from "../schemas/category.schema.js";
import { NotFoundError } from "../utils/appError.js";

export const createCategoryService = async (data: CreateCategoryDTO) => {
  const newCategory = await prisma.reportCategory.create({
    data: data,
  });

  return newCategory;
};

export const getAllCategoryService = async () => {
  const categories = await prisma.reportCategory.findMany({
    where: { deletedAt: null },
  });

  return categories;
};

export const getCategoryByIdService = async (categoryId: number) => {
  const category = await prisma.reportCategory.findFirst({
    where: { id: categoryId, deletedAt: null },
  });

  if (!category) throw new NotFoundError("Category not found");

  return category;
};

export const updateCategoryService = async (
  categoryId: number,
  data: UpdateCategoryDTO,
) => {
  const category = await prisma.reportCategory.findFirst({
    where: { id: categoryId, deletedAt: null },
  });

  if (!category) throw new NotFoundError("Category not found");

  const updatedCategory = await prisma.reportCategory.update({
    where: { id: categoryId, deletedAt: null },
    data: data,
  });

  return updatedCategory;
};

export const deleteCategoryByIdService = async (categoryId: number) => {
  const category = await prisma.reportCategory.findFirst({
    where: { id: categoryId, deletedAt: null },
  });

  if (!category) throw new NotFoundError("Category not found");

  await prisma.reportCategory.update({
    where: { id: categoryId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
};
