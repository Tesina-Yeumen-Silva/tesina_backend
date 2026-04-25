import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { getHistoryByReportIdService } from "../services/reportHistory.services.js";

export const getHistoryByReportId = catchAsync(
  async (req: Request, res: Response) => {
    const reportId = Number(req.params.reportId);

    const reportHistory = await getHistoryByReportIdService(reportId)

    res.status(200).json({
      data: reportHistory
    })
  },
);
