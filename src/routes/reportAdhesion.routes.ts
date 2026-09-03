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

router.post(
  "/toggle",
  authenticateJwt,
  apiLimiter,
  validateParams(generateIdSchema("reportId")),
  toggleAdhesion,
);
router.get(
  "/",
  authenticateJwt,
  apiLimiter,
  restrictTo(ROLES.ADMIN, ROLES.OPERATOR),
  validateParams(generateIdSchema("reportId")),
  getAdhesionsByReportId,
);

export default router;
