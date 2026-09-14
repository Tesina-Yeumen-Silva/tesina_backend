import { Router } from "express";
import { getHistoryByReportId } from "../controllers/reportHistory.controller.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { generateIdSchema } from "../schemas/common.schema.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";
import { apiLimiter } from "../config/rateLimit.js";

const router = Router({ mergeParams: true }); 

/**
 * @swagger
 * tags:
 *   name: Report History
 *   description: Report state transition history endpoints
 */

/**
 * @swagger
 * /reports/{reportId}/history:
 *   get:
 *     summary: Get state change history for a report
 *     tags: [Report History]
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
 *         description: Report history retrieved successfully
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
 *                   example: Report history retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       reportId:
 *                         type: integer
 *                         example: 10
 *                       stateId:
 *                         type: integer
 *                         example: 2
 *                       observation:
 *                         type: string
 *                         example: "Reporte ingresado en el sistema"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           name:
 *                             type: string
 *                             example: "Operador Municipal"
 *                           role:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "OPERATOR"
 *                       state:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "En Progreso"
 *                           color:
 *                             type: string
 *                             example: "#FFA500"
 *       400:
 *         description: Invalid report ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Report not found
 */
router.get(
  "/",
  authenticateJwt,
  apiLimiter,
  validateParams(generateIdSchema("reportId")),
  getHistoryByReportId,
);

export default router;