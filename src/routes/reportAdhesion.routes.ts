import { Router } from "express";
import {
  toggleAdhesion,
  getAdhesionsByReportId,
} from "../controllers/reportAdhesion.controller.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { generateIdSchema } from "../schemas/common.schema.js";
import { authenticateJwt, restrictTo } from "../middleware/auth.middleware.js";
import { ROLES } from "../constants/roles.js";
import { apiLimiter } from "../config/rateLimit.js";

const router = Router({ mergeParams: true });

/**
 * @swagger
 * tags:
 *   name: Report Adhesions
 *   description: Report adhesion (support/upvote) endpoints
 */

/**
 * @swagger
 * /reports/{reportId}/adhesions/toggle:
 *   post:
 *     summary: Toggle user adhesion to a report
 *     tags: [Report Adhesions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID to toggle adhesion for
 *     responses:
 *       200:
 *         description: Adhesion status toggled successfully
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
 *                   example: "Adhesión registrada"
 *                 data:
 *                   type: object
 *                   properties:
 *                     adhered:
 *                       type: boolean
 *                       example: true
 *       400:
 *         description: Invalid report ID or cannot adhere to own report
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 */
router.post(
  "/toggle",
  authenticateJwt,
  apiLimiter,
  validateParams(generateIdSchema("reportId")),
  toggleAdhesion,
);

/**
 * @swagger
 * /reports/{reportId}/adhesions:
 *   get:
 *     summary: Get all adhesions for a report
 *     tags: [Report Adhesions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Adhesions retrieved successfully
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
 *                   example: Adhesions retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     reportAdhesion:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           userId:
 *                             type: integer
 *                             example: 3
 *                           reportId:
 *                             type: integer
 *                             example: 10
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       400:
 *         description: Invalid report ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin/Operator only)
 *       404:
 *         description: Report not found
 */
router.get(
  "/",
  authenticateJwt,
  apiLimiter,
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  validateParams(generateIdSchema("reportId")),
  getAdhesionsByReportId,
);

export default router;
