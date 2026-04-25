import { Router } from "express";
import { createCategory,getAllCategory,getCategoryById,updateCategory,deleteCategoryById } from "../controllers/reportCategory.controller.js";
import { createCategorySchema, updateCategorySchema } from "../schemas/category.schema.js";
import { validateBody,validateParams } from "../middleware/validate.middleware.js";
import { generateIdSchema } from "../schemas/common.schema.js";

const router = Router();

router.post(
    '/',
    validateBody(createCategorySchema),
    createCategory
)

router.get(
    '/',
    getAllCategory
)

router.get(
    '/:categoryId',
    validateParams(generateIdSchema("categoryId")),
    getCategoryById
)

router.put(
    '/:categoryId',
    validateParams(generateIdSchema("categoryId")),
    validateBody(updateCategorySchema),
    updateCategory
)

router.delete(
    '/:categoryId',
    validateParams(generateIdSchema("categoryId")),
    deleteCategoryById
)



export default router;