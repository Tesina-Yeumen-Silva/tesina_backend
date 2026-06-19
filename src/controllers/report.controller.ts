import type { Request, Response } from "express";
import { BadRequestError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import { 
  changeStateService, 
  createReportService, 
  deleteReportByIdService, 
  getAllReportService, 
  getMapMarkersService, 
  getReportByIdService, 
  getReportsByUserIdService 
} from "../services/report.services.js";
import type { ChangeStateDTO, CreateReportDTO, GetReportsQueryDTO } from "../schemas/report.schema.js";

export const createReport = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new BadRequestError("La imagen es obligatoria");
  if (!req.user) throw new BadRequestError("User not found");
  const userId = req.user.userId;

  const reportData: CreateReportDTO = {
    ...req.body,
    originalBuffer: req.file.buffer,
    mimetype: req.file.mimetype,
  };

  const newReport = await createReportService(reportData, userId);
  sendResponse(res, 201, "Report created successfully", newReport);
});

export const getAllReport = catchAsync(
  async (req: Request, res: Response) => {
    const queryData = req.query as unknown as GetReportsQueryDTO;
    const result = await getAllReportService(queryData);

    sendResponse(
      res,
      200,
      "Reports retrieved successfully",
      result.reports,
      {
        currentPage: result.page,
        totalPages: Math.ceil(result.totalReports / result.limit),
        totalItems: result.totalReports
      }
    );
  },
);

export const getMapMarkers = catchAsync(async (req: Request, res: Response) => {
  const queryData = req.query as unknown as GetReportsQueryDTO;
  const result = await getMapMarkersService(queryData);
  sendResponse(res, 200, "Map markers retrieved successfully", result);
});

export const getReportById = catchAsync(async (req: Request, res: Response) => {
  const reportId = Number(req.params.reportId);
  const report = await getReportByIdService(reportId);
  sendResponse(res, 200, "Report retrieved successfully", report);
});

export const deleteReportById = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new BadRequestError("User not found");
  const userId = req.user.userId;
  const reportId = Number(req.params.reportId);

  await deleteReportByIdService(reportId, userId);
  sendResponse(res, 200, "Report deleted successfully");
});

export const changeState = catchAsync(async (req: Request, res: Response) => {
  const reportId = Number(req.params.reportId);
  const data: ChangeStateDTO = req.body;

  const updatedState = await changeStateService(reportId, data);
  sendResponse(res, 200, "Report state updated successfully", updatedState);
});

export const getReportsByUserId = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) throw new BadRequestError("User not found");
  const userId = req.user.userId;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await getReportsByUserIdService(userId, page, limit);

  sendResponse(res, 200, "Reports retrieved successfully", result.reports, result.meta);
});
