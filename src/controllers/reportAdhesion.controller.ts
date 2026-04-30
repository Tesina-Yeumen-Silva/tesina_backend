import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { getAdhesionsByReportIdService, toggleAdhesionService } from "../services/reportAdhesion.services.js";

export const toggleAdhesion = catchAsync(
  async (req: Request, res: Response) => {
    const reportId  = Number(req.params.reportId) ;
    
    const userId = req.user?.userId; 

    if (!userId) {
      throw new Error("Usuario no autenticado"); 
    }

    const result = await toggleAdhesionService(reportId, userId);

    res.status(200).json({
        message: result.adhered ? "Adhesión registrada" : "Adhesión eliminada",
        data: result
    });
  },
);
export const getAdhesionsByReportId = catchAsync(
  async (req: Request, res: Response) => {
    const reportId = Number(req.params.reportId);
    const users = await getAdhesionsByReportIdService(reportId)

    res.status(200).json({
      data: users
    })
  },
);
