import { Router } from "express";
import {
  createReport,
  getAllReport,
  getReportById,
  deleteReportById,
  changeState,
  getMapMarkers,
  getReportsByUserId,
} from "../controllers/report.controller.js";
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

const router = Router();

router.use("/:reportId/history", historyRouter);
router.use("/:reportId/adhesions", adhesionRouter);

router.post(
  "/",
  uploadMiddleware.single("image"),
  authenticateJwt,
  validateBody(createReportSchema),
  createReport,
);

router.get(
  "/",
  authenticateJwt,
  validateQuery(getReportQuerySchema),
  getAllReport,
);

router.get("/markers", validateQuery(getReportQuerySchema), getMapMarkers);

router.get("/user-reports", authenticateJwt, getReportsByUserId);

router.get(
  "/:reportId",
  validateParams(generateIdSchema("reportId")),
  getReportById,
);

router.delete(
  "/:reportId",
  authenticateJwt,
  validateParams(generateIdSchema("reportId")),
  deleteReportById,
);

router.put(
  "/:reportId/state",
  authenticateJwt,
  restrictTo(ROLES.ADMIN, ROLES.MUNI),
  validateParams(generateIdSchema("reportId")),
  validateBody(changeStateSchema),
  changeState,
);

export default router;
