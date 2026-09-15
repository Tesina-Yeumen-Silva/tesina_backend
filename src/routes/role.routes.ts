import express from "express";
import {
  createRole,
  getAllRole,
  getRoleById,
  updateRole,
  deleteRoleById,
} from "../controllers/role.controller.js";
import {
  validateParams,
  validateBody,
} from "../middleware/validate.middleware.js";
import { createRoleSchema, updateRoleSchema } from "../schemas/role.schema.js";
import { generateIdSchema } from "../schemas/common.schema.js";
import { authenticateJwt, restrictTo } from "../middleware/auth.middleware.js";
import { ROLES } from "../constants/roles.js";
import { apiLimiter } from "../config/rateLimit.js";

const router = express.Router();

router.use(authenticateJwt);
router.use(apiLimiter);

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management endpoints
 */

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 */
router.post(
  "/",
  restrictTo(ROLES.ADMIN),
  validateBody(createRoleSchema),
  createRole,
);

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin/Operator only)
 */
router.get("/", restrictTo(ROLES.ADMIN, ROLES.OPERATOR), getAllRole);

/**
 * @swagger
 * /roles/{roleId}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       200:
 *         description: Role found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Role not found
 */
router.get(
  "/:roleId",
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("roleId")),
  getRoleById,
);

/**
 * @swagger
 * /roles/{roleId}:
 *   put:
 *     summary: Update a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Role not found
 */
router.put(
  "/:roleId",
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("roleId")),
  validateBody(updateRoleSchema),
  updateRole,
);

/**
 * @swagger
 * /roles/{roleId}:
 *   delete:
 *     summary: Delete a role by ID
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *     responses:
 *       204:
 *         description: Role deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Role not found
 */
router.delete(
  "/:roleId",
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("roleId")),
  deleteRoleById,
);

export default router;
