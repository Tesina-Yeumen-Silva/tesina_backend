import { Router } from "express";
import { toggleAdhesion, getAdhesionsByReportId } from "../controllers/reportAdhesion.controller.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { generateIdSchema } from "../schemas/common.schema.js";
const router = Router({ mergeParams: true });

router.post("/",validateParams(generateIdSchema("reportId")) ,toggleAdhesion);     
router.get("/",validateParams(generateIdSchema("reportId")),getAdhesionsByReportId);

export default router;