import { Router } from "express";
import {
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  deleteCategoryById,
} from "../controllers/reportCategory.controller.js";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../schemas/category.schema.js";
import {
  validateBody,
  validateParams,
} from "../middleware/validate.middleware.js";
import { generateIdSchema } from "../schemas/common.schema.js";
import { authenticateJwt, restrictTo } from "../middleware/auth.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = Router();

router.post(
  "/",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateBody(createCategorySchema),
  createCategory,
);

router.get("/", authenticateJwt, getAllCategory);

router.get(
  "/:categoryId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN, ROLES.MUNI),
  validateParams(generateIdSchema("categoryId")),
  getCategoryById,
);

router.put(
  "/:categoryId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("categoryId")),
  validateBody(updateCategorySchema),
  updateCategory,
);

router.delete(
  "/:categoryId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("categoryId")),
  deleteCategoryById,
);

export default router;
