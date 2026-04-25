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

const router = Router();

router.post(
  "/",
  authenticateJwt,
  restrictTo("admin"),
  validateBody(createCategorySchema),
  createCategory,
);

router.get("/", authenticateJwt, restrictTo("admin", "muni"), getAllCategory);

router.get(
  "/:categoryId",
  authenticateJwt,
  restrictTo("admin", "muni"),
  validateParams(generateIdSchema("categoryId")),
  getCategoryById,
);

router.put(
  "/:categoryId",
  authenticateJwt,
  restrictTo("admin"),
  validateParams(generateIdSchema("categoryId")),
  validateBody(updateCategorySchema),
  updateCategory,
);

router.delete(
  "/:categoryId",
  authenticateJwt,
  restrictTo("admin"),
  validateParams(generateIdSchema("categoryId")),
  deleteCategoryById,
);

export default router;
