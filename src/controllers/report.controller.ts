import type { Request, Response } from "express";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { prisma } from "../config/prisma.js";
import { createReportService } from "../services/report.services.js";
import type { CreateReportDTO } from "../schemas/report.schema.js";

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
  async (req: Request, res: Response) => {},
);

export const getReportById = catchAsync(
  async (req: Request, res: Response) => {},
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
