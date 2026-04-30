import type { Request, Response } from "express";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../config/prisma.js";
import { changeStateService, createReportService, deleteReportByIdService, getAllReportService, getMapMarkersService, getReportByIdService, getReportsByUserIdService } from "../services/report.services.js";
import type { ChangeStateDTO, CreateReportDTO, GetReportsQueryDTO } from "../schemas/report.schema.js";



export const createReport = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("La imagen es obligatoria", 400);
  if(!req.user) throw new AppError("User not found",400)
  const userId = req.user.userId;

  const reportData: CreateReportDTO = {
    ...req.body,
    originalBuffer: req.file.buffer,
    mimetype: req.file.mimetype,
  };

  const newReport = await createReportService(reportData,userId);

  res.status(201).json({
    message: "Report created successfully",
    data: newReport,
  });
});

export const getAllReport = catchAsync(
  async (req: Request, res: Response) => {
    const queryData = req.query as unknown as GetReportsQueryDTO;

    const result = await getAllReportService(queryData);

    res.status(200).json({
        data: result.reports,
        meta: {
            currentPage: result.page,
            totalPages: Math.ceil(result.totalReports / result.limit),
            totalItems: result.totalReports
        }
    });
  },
);

export const getMapMarkers = catchAsync(
  async (req: Request, res: Response) => {
    const queryData = req.query as unknown as GetReportsQueryDTO;

    const result = await getMapMarkersService(queryData);

    res.status(200).json({
      data: result
    })
  }
);

export const getReportById = catchAsync(
  async (req: Request, res: Response) => {
    const reportId = Number(req.params.reportId);

    const report = await getReportByIdService(reportId);

    res.status(200).json({
      data:report
    })
  },
);

export const deleteReportById = catchAsync(
  async (req: Request, res: Response) => {
    if(!req.user) throw new AppError("User not found",400)
    const userId = req.user.userId;
    console.log(userId)
    const reportId = Number(req.params.reportId);

    await deleteReportByIdService(reportId,userId);

    res.status(200).json({
      message:"Report deleted successfully"
    })
  },
);

export const changeState = catchAsync(
  async (req: Request, res: Response) => {
    const reportId = Number(req.params.reportId);
    const data : ChangeStateDTO = req.body;

    const updatedState = await changeStateService(reportId,data)

    res.status(200).json({
      message:" State updated successfully",
      data: updatedState
    })
  },

);

export const getReportsByUserId = catchAsync( async (req: Request, res: Response) => {
  if (!req.user) throw new AppError("User not found", 400);
  
  const userId = req.user.userId;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;

  const result = await getReportsByUserIdService(userId, page, limit);

  res.status(200).json({
    data: result.reports,
    meta: result.meta 
  });
});
