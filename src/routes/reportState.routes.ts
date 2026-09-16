import { Router } from "express";
import {
  createState,
  getAllStates,
  getStateById,
  updateState,
  deleteStateById,
} from "../controllers/reportState.controller.js";
import {
  createStateSchema,
  updateStateSchema,
} from "../schemas/state.schema.js";
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
 *   name: Report States
 *   description: Report state management endpoints
 */

/**
 * @swagger
 * /report-states:
 *   post:
 *     summary: Create a new report state
 *     tags: [Report States]
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
 *               - color
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 example: "En revisión"
 *                 description: Name of the report state
 *               color:
 *                 type: string
 *                 example: "#FFA500"
 *                 description: Hex color code representing the state
 *     responses:
 *       201:
 *         description: State created successfully
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
 *                   example: State created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "En revisión"
 *                     color:
 *                       type: string
 *                       example: "#FFA500"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       409:
 *         description: Conflict (State name already exists)
 */
router.post(
  "/",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateBody(createStateSchema),
  createState,
);

/**
 * @swagger
 * /report-states:
 *   get:
 *     summary: Get all report states
 *     tags: [Report States]
 *     responses:
 *       200:
 *         description: States retrieved successfully
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
 *                   example: States retrieved successfully
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
 *                         example: "Pendiente"
 *                       color:
 *                         type: string
 *                         example: "#9E9E9E"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: Internal server error
 */
router.get(
  "/",
  getAllStates,
);

/**
 * @swagger
 * /report-states/{stateId}:
 *   get:
 *     summary: Get a report state by ID
 *     tags: [Report States]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report state ID
 *     responses:
 *       200:
 *         description: State retrieved successfully
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
 *                   example: State retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Pendiente"
 *                     color:
 *                       type: string
 *                       example: "#9E9E9E"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid state ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin/Operator only)
 *       404:
 *         description: Report state not found
 */
router.get(
  "/:stateId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  validateParams(generateIdSchema("stateId")),
  getStateById,
);

/**
 * @swagger
 * /report-states/{stateId}:
 *   put:
 *     summary: Update a report state by ID
 *     tags: [Report States]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report state ID
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
 *                 example: "Resuelto"
 *                 description: State name
 *               color:
 *                 type: string
 *                 example: "#28A745"
 *                 description: Hex color code representing the state
 *     responses:
 *       200:
 *         description: State updated successfully
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
 *                   example: State updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "Resuelto"
 *                     color:
 *                       type: string
 *                       example: "#28A745"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Report state not found
 *       409:
 *         description: Conflict (State name already in use)
 */
router.put(
  "/:stateId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("stateId")),
  validateBody(updateStateSchema),
  updateState,
);

/**
 * @swagger
 * /report-states/{stateId}:
 *   delete:
 *     summary: Delete a report state by ID
 *     tags: [Report States]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: stateId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report state ID
 *     responses:
 *       200:
 *         description: State deleted successfully
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
 *                   example: State deleted successfully
 *       400:
 *         description: Invalid state ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin only)
 *       404:
 *         description: Report state not found
 */
router.delete(
  "/:stateId",
  authenticateJwt,
  restrictTo(ROLES.ADMIN),
  validateParams(generateIdSchema("stateId")),
  deleteStateById,
);

export default router;
