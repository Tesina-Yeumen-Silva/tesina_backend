import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import { getHistoryByReportIdService } from "../services/reportHistory.services.js";

export const getHistoryByReportId = catchAsync(
  async (req: Request, res: Response) => {
    const reportId = Number(req.params.reportId);
    const reportHistory = await getHistoryByReportIdService(reportId);
    sendResponse(res, 200, "Report history retrieved successfully", reportHistory);
  },
);
