import { Router } from "express";
import { createCategory,getAllCategory,getCategoryById,updateCategory,deleteCategoryById } from "../controllers/reportCategory.controller.js";
const router = Router();

router.post(
    '/',
    createCategory
)

router.get(
    '/',
    getAllCategory
)

router.get(
    '/:categoryId',
    getCategoryById
)

router.put(
    '/:categoryId',
    updateCategory
)

router.delete(
    '/:categoryId',
    deleteCategoryById
)



export default router;