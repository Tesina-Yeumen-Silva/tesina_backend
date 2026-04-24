import { Router } from "express";
import {
  createReport,
  getAllReport,
  getReportById,
  deleteReportById,
  changeState,
  getMapMarkers,
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

const router = Router();

router.use("/:reportId/history", historyRouter);
router.use("/:reportId/adhesions", adhesionRouter);

router.post(
  "/",
  uploadMiddleware.single("image"),
  validateBody(createReportSchema),
  createReport,
);

router.get("/", validateQuery(getReportQuerySchema), getAllReport);

router.get("/markers", validateQuery(getReportQuerySchema), getMapMarkers);

router.get(
  "/:reportId",
  validateParams(generateIdSchema("reportId")),
  getReportById,
);

router.delete(
  "/:reportId",
  validateParams(generateIdSchema("reportId")),
  deleteReportById,
);

router.put(
  "/:reportId/state",
  validateParams(generateIdSchema("reportId")),
  validateBody(changeStateSchema),
  changeState,
);



export default router;
