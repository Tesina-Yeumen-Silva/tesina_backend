import { Router } from "express";
import reportCategoryController from "../controllers/reportCategory.controller.js";

const router = Router();

router.post(
    '/',
    reportCategoryController.createCategory
)

router.get(
    '/',
    reportCategoryController.getAllCategory
)

router.get(
    '/:categoryId',
    reportCategoryController.getCategoryById
)

router.put(
    '/:categoryId',
    reportCategoryController.updateCategory
)

router.delete(
    '/:categoryId',
    reportCategoryController.deleteCategoryById
)



export default router;