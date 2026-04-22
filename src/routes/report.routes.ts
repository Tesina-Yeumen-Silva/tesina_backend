import { Router } from "express";
import { createReport,getAllReport,getReportById,updateReport,deleteReportById,changeState } from "../controllers/report.controller.js";
import { toggleAdhesion, getAdhesionsByReportId } from "../controllers/reportAdhesion.controller.js";
import { getAllHistory,getHistoryByReportId } from "../controllers/reportHistory.controller.js";
import { uploadMiddleware } from "../middleware/upload.middleware.js";

const router = Router();

router.post(
    '/',
    uploadMiddleware.single('image'),
    createReport
)

router.get(
    '/',
    getAllReport
)

router.get(
    '/:reportId',
    getReportById
)

router.put(
    '/:reportId',
    updateReport
)

router.delete(
    '/:reportId',
    deleteReportById
)

router.put(
    '/:reportId/state',
    changeState
)

router.get(
    '/',
    getAllHistory
)

router.get(
    '/:reportId',
    getHistoryByReportId
)

router.post(
    '/:reportId/adhesions',
    toggleAdhesion
)

router.get(
    '/:reportId/adhesions',
    getAdhesionsByReportId
)



export default router;