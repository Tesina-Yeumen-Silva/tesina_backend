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

router.use("/:reportId/history", historyRouter);
router.use("/:reportId/adhesions", adhesionRouter);

router.post(
  "/",
  uploadMiddleware.single("image"),
  authenticateJwt,
  apiLimiter,
  validateBody(createReportSchema),
  createReport,
);

router.get(
  "/",
  authenticateJwt,
  apiLimiter,
  validateQuery(getReportQuerySchema),
  getAllReport,
);

router.get(
  "/markers",
  apiLimiter,
  validateQuery(getReportQuerySchema),
  getMapMarkers,
);

router.get(
  "/metrics",
  authenticateJwt,
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  getDashboardMetrics
);

router.get(
  "/user-reports",
  authenticateJwt,
  apiLimiter,
  getReportsByUserId,
);

router.get(
  "/adhered-reports",
  authenticateJwt,
  apiLimiter,
  getAdheredReportsByUserId,
);

router.get(
  "/:reportId",
  apiLimiter,
  validateParams(generateIdSchema("reportId")),
  getReportById,
);

router.delete(
  "/:reportId",
  authenticateJwt,
  apiLimiter,
  validateParams(generateIdSchema("reportId")),
  deleteReportById,
);

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
