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

router.use(apiLimiter);

/**
 * @swagger
 * tags:
 *   name: Report Categories
 *   description: Report category management endpoints
 */

/**
 * @swagger
 * /report-categories:
 *   post:
 *     summary: Create a new report category
 *     description: Creates a new category for grouping citizen reports. Admin only.
 *     tags: [Report Categories]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Bacheo y Asfalto
 *     responses:
 *       201:
 *         description: Category created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Category created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Bacheo y Asfalto
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       409:
 *         description: Category already exists
 *       500:
 *         description: Internal server error
 */
router.post(
  "/",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateBody(createCategorySchema),
  createCategory,
);

/**
 * @swagger
 * /report-categories:
 *   get:
 *     summary: Get all report categories
 *     description: Retrieves a list of all report categories.
 *     tags: [Report Categories]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Categories retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: Bacheo y Asfalto
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.get("/", getAllCategory);

/**
 * @swagger
 * /report-categories/{categoryId}:
 *   get:
 *     summary: Get a report category by ID
 *     description: Retrieves details of a specific report category by ID. Accessible by Admin and Operator roles.
 *     tags: [Report Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the category
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Category retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Bacheo y Asfalto
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin/Operator only)
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.get(
  "/:categoryId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  validateParams(generateIdSchema("categoryId")),
  getCategoryById,
);

/**
 * @swagger
 * /report-categories/{categoryId}:
 *   put:
 *     summary: Update a report category by ID
 *     description: Updates the name of an existing report category. Admin only.
 *     tags: [Report Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: Alumbrado Público
 *     responses:
 *       200:
 *         description: Category updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Category updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Alumbrado Público
 *       400:
 *         description: Validation error or invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.put(
  "/:categoryId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("categoryId")),
  validateBody(updateCategorySchema),
  updateCategory,
);

/**
 * @swagger
 * /report-categories/{categoryId}:
 *   delete:
 *     summary: Delete a report category by ID
 *     description: Soft deletes a report category by ID. Admin only.
 *     tags: [Report Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the category
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Category deleted successfully
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
router.delete(
  "/:categoryId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("categoryId")),
  deleteCategoryById,
);

export default router;
