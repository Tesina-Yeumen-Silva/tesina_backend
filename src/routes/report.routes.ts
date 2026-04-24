import { Router } from "express";
import {
  createReport,
  getAllReport,
  getReportById,
  updateReport,
  deleteReportById,
  changeState,
  getMapMarkers
} from "../controllers/report.controller.js";
import {
  toggleAdhesion,
  getAdhesionsByReportId,
} from "../controllers/reportAdhesion.controller.js";
import {
  getAllHistory,
  getHistoryByReportId,
} from "../controllers/reportHistory.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.middleware.js";
import {
  createReportSchema,
  getReportQuerySchema,
} from "../schemas/report.schema.js";
import { generateIdSchema } from "../schemas/common.schema.js";
const router = Router();

router.post(
  "/",
  uploadMiddleware.single("image"),
  validateBody(createReportSchema),
  createReport,
);

router.get("/", validateQuery(getReportQuerySchema), getAllReport);

router.get('/markers', validateQuery(getReportQuerySchema), getMapMarkers);

router.get("/:reportId",validateParams(generateIdSchema("reportId")), getReportById);

router.put("/:reportId", updateReport);

router.delete("/:reportId", deleteReportById);

router.put("/:reportId/state", changeState);

router.get("/", getAllHistory);

router.get("/:reportId", getHistoryByReportId);

router.post("/:reportId/adhesions", toggleAdhesion);

router.get("/:reportId/adhesions", getAdhesionsByReportId);

export default router;
