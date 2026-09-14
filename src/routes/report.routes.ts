import { Router } from "express";
import {
  createReport,
  getAllReport,
  getReportById,
  deleteReportById,
  changeState,
  getMapMarkers,
  getReportsByUserId,
  getAdheredReportsByUserId,
} from "../controllers/report.controller.js";
import { getDashboardMetrics } from "../controllers/metrics.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware.js";
import {
  createReportSchema,
  getReportQuerySchema,
  changeStateSchema,
} from "../schemas/report.schema.js";
import { generateIdSchema } from "../schemas/common.schema.js";
import historyRouter from "./reportHistory.routes.js";
import adhesionRouter from "./reportAdhesion.routes.js";
import { authenticateJwt, restrictTo } from "../middleware/auth.middleware.js";
import { ROLES } from "../constants/roles.js";
import { apiLimiter } from "../config/rateLimit.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Citizen report management and tracking endpoints
 */

router.use("/:reportId/history", historyRouter);
router.use("/:reportId/adhesions", adhesionRouter);

/**
 * @swagger
 * /reports:
 *   post:
 *     summary: Create a new report with an image
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *               - latitude
 *               - longitude
 *               - description
 *               - categoryId
 *               - image
 *             properties:
 *               address:
 *                 type: string
 *                 minLength: 5
 *                 example: "Av. Corrientes 1234, CABA"
 *                 description: Physical address or location description
 *               latitude:
 *                 type: number
 *                 format: float
 *                 example: -34.6037
 *                 description: Geographic latitude
 *               longitude:
 *                 type: number
 *                 format: float
 *                 example: -58.3816
 *                 description: Geographic longitude
 *               description:
 *                 type: string
 *                 example: "Bache profundo en el carril derecho dificultando el tránsito"
 *                 description: Detailed description of the problem
 *               categoryId:
 *                 type: integer
 *                 example: 1
 *                 description: ID of the report category
 *               isAnonymous:
 *                 type: boolean
 *                 example: false
 *                 description: Whether to hide the reporter's identity
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file representing the incident (JPEG, PNG, or WebP, max 10MB)
 *     responses:
 *       201:
 *         description: Report created successfully
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
 *                   example: Report created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 10
 *                     address:
 *                       type: string
 *                       example: "Av. Corrientes 1234, CABA"
 *                     latitude:
 *                       type: number
 *                       example: -34.6037
 *                     longitude:
 *                       type: number
 *                       example: -58.3816
 *                     description:
 *                       type: string
 *                       example: "Bache profundo en el carril derecho"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://bucket.s3.amazonaws.com/report-10.webp"
 *                     isAnonymous:
 *                       type: boolean
 *                       example: false
 *                     userId:
 *                       type: integer
 *                       example: 3
 *                     categoryId:
 *                       type: integer
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Validation error or missing required image
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  uploadMiddleware.single("image"),
  authenticateJwt,
  apiLimiter,
  validateBody(createReportSchema),
  createReport,
);

/**
 * @swagger
 * /reports:
 *   get:
 *     summary: Get all reports with optional pagination and geographic bounding box filters
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of reports per page
 *       - in: query
 *         name: minLat
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum latitude for bounding box filter
 *       - in: query
 *         name: maxLat
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum latitude for bounding box filter
 *       - in: query
 *         name: minLng
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum longitude for bounding box filter
 *       - in: query
 *         name: maxLng
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum longitude for bounding box filter
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter reports by category ID
 *       - in: query
 *         name: stateId
 *         schema:
 *           type: integer
 *         description: Filter reports by state ID
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
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
 *                   example: Reports retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 10
 *                       address:
 *                         type: string
 *                         example: "Av. Corrientes 1234, CABA"
 *                       latitude:
 *                         type: number
 *                         example: -34.6037
 *                       longitude:
 *                         type: number
 *                         example: -58.3816
 *                       description:
 *                         type: string
 *                         example: "Bache profundo"
 *                       imageUrl:
 *                         type: string
 *                         example: "https://bucket.s3.amazonaws.com/image.webp"
 *                       isAnonymous:
 *                         type: boolean
 *                         example: false
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       category:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "Baches"
 *                       reportHistory:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             state:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "En Progreso"
 *                                 color:
 *                                   type: string
 *                                   example: "#FFA500"
 *                       _count:
 *                         type: object
 *                         properties:
 *                           reportAdhesion:
 *                             type: integer
 *                             example: 5
 *                 meta:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 95
 *       400:
 *         description: Invalid query parameters
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/",
  authenticateJwt,
  apiLimiter,
  validateQuery(getReportQuerySchema),
  getAllReport,
);

/**
 * @swagger
 * /reports/markers:
 *   get:
 *     summary: Get lightweight map markers for public visualization
 *     tags: [Reports]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: minLat
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum latitude for bounding box filter
 *       - in: query
 *         name: maxLat
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum latitude for bounding box filter
 *       - in: query
 *         name: minLng
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum longitude for bounding box filter
 *       - in: query
 *         name: maxLng
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum longitude for bounding box filter
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: integer
 *         description: Filter markers by category ID
 *       - in: query
 *         name: stateId
 *         schema:
 *           type: integer
 *         description: Filter markers by state ID
 *     responses:
 *       200:
 *         description: Map markers retrieved successfully
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
 *                   example: Map markers retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       latitude:
 *                         type: number
 *                         example: -34.6037
 *                       longitude:
 *                         type: number
 *                         example: -58.3816
 *                       status:
 *                         type: string
 *                         example: "En Progreso"
 *                       statusColor:
 *                         type: string
 *                         example: "#FFA500"
 *       400:
 *         description: Invalid query parameters
 */
router.get(
  "/markers",
  apiLimiter,
  validateQuery(getReportQuerySchema),
  getMapMarkers,
);

/**
 * @swagger
 * /reports/metrics:
 *   get:
 *     summary: Get dashboard metrics and resolution statistics
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics retrieved successfully
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
 *                   example: Metrics retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         totalReports:
 *                           type: integer
 *                           example: 120
 *                         totalSolved:
 *                           type: integer
 *                           example: 75
 *                         averageResolutionTimeHours:
 *                           type: number
 *                           example: 36.4
 *                         reportsByCategory:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Baches"
 *                               count:
 *                                 type: integer
 *                                 example: 45
 *                         reportsByState:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Resuelto"
 *                               count:
 *                                 type: integer
 *                                 example: 75
 *                     exportData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           fechaCreacion:
 *                             type: string
 *                             format: date-time
 *                           direccion:
 *                             type: string
 *                             example: "Av. Corrientes 1234"
 *                           categoria:
 *                             type: string
 *                             example: "Baches"
 *                           estadoActual:
 *                             type: string
 *                             example: "Resuelto"
 *                           adhesiones:
 *                             type: integer
 *                             example: 10
 *                           esAnonimo:
 *                             type: string
 *                             example: "No"
 *                           fechaResolucion:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                           horasResolucion:
 *                             type: string
 *                             nullable: true
 *                             example: "24.50"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin/Operator only)
 */
router.get(
  "/metrics",
  authenticateJwt,
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  getDashboardMetrics
);

/**
 * @swagger
 * /reports/user-reports:
 *   get:
 *     summary: Get reports created by the authenticated user
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: User reports retrieved successfully
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
 *                   example: Reports retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       address:
 *                         type: string
 *                         example: "Av. San Martín 500"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       categoryName:
 *                         type: string
 *                         example: "Alumbrado"
 *                       stateName:
 *                         type: string
 *                         example: "Pendiente"
 *                       stateColor:
 *                         type: string
 *                         example: "#9E9E9E"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 5
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     hasMore:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/user-reports",
  authenticateJwt,
  apiLimiter,
  getReportsByUserId,
);

/**
 * @swagger
 * /reports/adhered-reports:
 *   get:
 *     summary: Get reports the authenticated user has adhered to
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Adhered reports retrieved successfully
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
 *                   example: Adhered reports retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       address:
 *                         type: string
 *                         example: "Calle 10 y 45"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       categoryName:
 *                         type: string
 *                         example: "Basura"
 *                       stateName:
 *                         type: string
 *                         example: "En Progreso"
 *                       stateColor:
 *                         type: string
 *                         example: "#FFA500"
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 3
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     hasMore:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/adhered-reports",
  authenticateJwt,
  apiLimiter,
  getAdheredReportsByUserId,
);

/**
 * @swagger
 * /reports/{reportId}:
 *   get:
 *     summary: Get detailed report information by ID
 *     tags: [Reports]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID
 *     responses:
 *       200:
 *         description: Report retrieved successfully
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
 *                   example: Report retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     address:
 *                       type: string
 *                       example: "Av. Corrientes 1234, CABA"
 *                     latitude:
 *                       type: number
 *                       example: -34.6037
 *                     longitude:
 *                       type: number
 *                       example: -58.3816
 *                     description:
 *                       type: string
 *                       example: "Bache profundo en el carril derecho"
 *                     imageUrl:
 *                       type: string
 *                       example: "https://bucket.s3.amazonaws.com/image.webp"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     category:
 *                       type: string
 *                       example: "Baches"
 *                     updatedState:
 *                       type: string
 *                       format: date-time
 *                     status:
 *                       type: string
 *                       example: "En Progreso"
 *                     statusColor:
 *                       type: string
 *                       example: "#FFA500"
 *                     reporterName:
 *                       type: string
 *                       example: "Juan Pérez"
 *                     adhesionsCount:
 *                       type: integer
 *                       example: 12
 *       400:
 *         description: Invalid report ID
 *       404:
 *         description: Report not found
 */
router.get(
  "/:reportId",
  apiLimiter,
  validateParams(generateIdSchema("reportId")),
  getReportById,
);

/**
 * @swagger
 * /reports/{reportId}:
 *   delete:
 *     summary: Soft delete a report by ID (owner only, pending status only)
 *     tags: [Reports]
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
 *         description: Report deleted successfully
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
 *                   example: Report deleted successfully
 *       400:
 *         description: Invalid report ID
 *       401:
 *         description: Unauthorized (only owner can delete report)
 *       403:
 *         description: Forbidden (cannot delete report that is already in progress or resolved)
 *       404:
 *         description: Report not found
 */
router.delete(
  "/:reportId",
  authenticateJwt,
  apiLimiter,
  validateParams(generateIdSchema("reportId")),
  deleteReportById,
);

/**
 * @swagger
 * /reports/{reportId}/state:
 *   put:
 *     summary: Update the state of a report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reportId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Report ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - stateId
 *             properties:
 *               stateId:
 *                 type: integer
 *                 example: 2
 *                 description: ID of the new report state
 *               observation:
 *                 type: string
 *                 example: "Cuadrilla asignada para reparación"
 *                 description: Optional observation or note explaining the state change
 *     responses:
 *       200:
 *         description: Report state updated successfully
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
 *                   example: Report state updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 15
 *                     reportId:
 *                       type: integer
 *                       example: 1
 *                     stateId:
 *                       type: integer
 *                       example: 2
 *                     observation:
 *                       type: string
 *                       example: "Cuadrilla asignada para reparación"
 *                     userId:
 *                       type: integer
 *                       example: 5
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     state:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "En Progreso"
 *                         color:
 *                           type: string
 *                           example: "#FFA500"
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 5
 *                         name:
 *                           type: string
 *                           example: "Operador Municipal"
 *       400:
 *         description: Invalid input or validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (Admin/Operator only)
 *       404:
 *         description: Report not found
 */
router.put(
  "/:reportId/state",
  authenticateJwt,
  apiLimiter,
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  validateParams(generateIdSchema("reportId")),
  validateBody(changeStateSchema),
  changeState,
);

export default router;
