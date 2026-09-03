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
import { apiLimiter } from "../config/rateLimit.js";

const router = Router();

router.use(authenticateJwt);
router.use(apiLimiter);

router.post(
  "/",
  restrictTo(ROLES.ADMIN),
  validateBody(createCategorySchema),
  createCategory,
);

router.get("/", getAllCategory);

router.get(
  "/:categoryId",
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  validateParams(generateIdSchema("categoryId")),
  getCategoryById,
);

router.put(
  "/:categoryId",
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("categoryId")),
  validateBody(updateCategorySchema),
  updateCategory,
);

router.delete(
  "/:categoryId",
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("categoryId")),
  deleteCategoryById,
);

export default router;
