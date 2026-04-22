import { Router } from "express";
import reportController from "../controllers/report.controller.js";
import reportAdhesionController from "../controllers/reportAdhesion.controller.js";
import reportHistoryController from "../controllers/reportHistory.controller.js";

const router = Router();

router.post(
    '/',
    reportController.createReport
)

router.get(
    '/',
    reportController.getAllReport
)

router.get(
    '/:reportId',
    reportController.getReportById
)

router.put(
    '/:reportId',
    reportController.updateReport
)

router.delete(
    '/:reportId',
    reportController.deleteReportById
)

router.put(
    '/:reportId/state',
    reportController.changeState
)

router.get(
    '/',
    reportHistoryController.getAllHistory
)

router.get(
    '/:reportId',
    reportHistoryController.getHistoryByReportId
)

router.post(
    '/:reportId/adhesions',
    reportAdhesionController.toggleAdhesion
)

router.get(
    '/:reportId/adhesions',
    reportAdhesionController.getAdhesionsByReportId
)

export default router;