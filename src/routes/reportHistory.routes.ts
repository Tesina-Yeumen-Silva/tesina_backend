import { Router } from "express";
import { getHistoryByReportId } from "../controllers/reportHistory.controller.js";
import { validateParams } from "../middleware/validate.middleware.js";
import { generateIdSchema } from "../schemas/common.schema.js";
import { authenticateJwt } from "../middleware/auth.middleware.js";
const router = Router({ mergeParams: true }); 

router.get("/",authenticateJwt,validateParams(generateIdSchema("reportId")), getHistoryByReportId); 

export default router;