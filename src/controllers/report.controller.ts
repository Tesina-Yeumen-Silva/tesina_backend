import type { Request, Response } from "express";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../config/prisma.js";
import { createReportService, getAllReportService, getMapMarkersService, getReportByIdService } from "../services/report.services.js";
import type { CreateReportDTO, GetReportsQueryDTO } from "../schemas/report.schema.js";

/*if(!req.user) throw new AppError("User not found",400)
const userId = req.user.userId;*/

export const createReport = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) throw new AppError("La imagen es obligatoria", 400);

  const reportData: CreateReportDTO = {
    ...req.body,
    originalBuffer: req.file.buffer,
    mimetype: req.file.mimetype,
  };

  const newReport = await createReportService(reportData);

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

export const updateReport = catchAsync(
  async (req: Request, res: Response) => {},
);

export const deleteReportById = catchAsync(
  async (req: Request, res: Response) => {},
);

export const changeState = catchAsync(
  async (req: Request, res: Response) => {},
);
