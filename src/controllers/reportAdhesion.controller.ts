import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import { getAdhesionsByReportIdService, toggleAdhesionService } from "../services/reportAdhesion.services.js";

export const toggleAdhesion = catchAsync(
  async (req: Request, res: Response) => {
    const reportId  = Number(req.params.reportId);
    const userId = req.user?.userId; 

    if (!userId) {
      throw new Error("Usuario no autenticado"); 
    }

    const result = await toggleAdhesionService(reportId, userId);
    sendResponse(res, 200, result.adhered ? "Adhesión registrada" : "Adhesión eliminada", result);
  },
);

export const getAdhesionsByReportId = catchAsync(
  async (req: Request, res: Response) => {
    const reportId = Number(req.params.reportId);
    const users = await getAdhesionsByReportIdService(reportId);
    sendResponse(res, 200, "Adhesions retrieved successfully", users);
  },
);
