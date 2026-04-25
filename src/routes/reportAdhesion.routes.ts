import { Router } from "express";
import { toggleAdhesion, getAdhesionsByReportId } from "../controllers/reportAdhesion.controller.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { generateIdSchema } from "../schemas/common.schema.js";
import { authenticateJwt, restrictTo } from "../middleware/auth.middleware.js";
const router = Router({ mergeParams: true });

router.get("/toggle",authenticateJwt,restrictTo("user","admin"),validateParams(generateIdSchema("reportId")) ,toggleAdhesion);     
router.get("/",authenticateJwt,restrictTo("admin","muni"),validateParams(generateIdSchema("reportId")),getAdhesionsByReportId);

export default router;