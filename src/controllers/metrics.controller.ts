import type { Request, Response } from "express";
import { getDashboardMetricsService } from "../services/metrics.services.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";

export const getDashboardMetrics = catchAsync(async (req: Request, res: Response) => {
  const result = await getDashboardMetricsService();
  sendResponse(res, 200, "Metrics retrieved successfully", result);
});
