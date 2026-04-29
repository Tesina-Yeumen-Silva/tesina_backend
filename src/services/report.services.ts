import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { uploadImageToCloud } from "./cloud.services.js";
import { optimizeImageService } from "./image.services.js";
import type {
  ChangeStateDTO,
  CreateReportDTO,
  GetReportsQueryDTO,
} from "../schemas/report.schema.js";
import { Prisma } from "../generated/prisma/client.js";

export const createReportService = async (
  data: CreateReportDTO,
  userId: number,
) => {
  const createdState = await prisma.reportState.findFirst({
    where: { name: "Pending" },
  });

  if (!createdState) throw new AppError("State not found", 400);

  const { buffer: optimizedImage } = await optimizeImageService(
    data.originalBuffer,
  );
  const cloudUrl = await uploadImageToCloud(optimizedImage, data.mimetype);

  const newReport = await prisma.report.create({
    data: {
      address: data.address,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      description: data.description,
      imageUrl: cloudUrl,
      isAnonymous: data.isAnonymous,
      userId: userId,
      categoryId: Number(data.categoryId),
      reportHistory: {
        create: {
          stateId: createdState.id,
          observation: "Reporte ingresado en el sistema",
        },
      },
    },
  });

  return newReport;
};

export const getAllReportService = async (query: GetReportsQueryDTO) => {
  const { page, limit, minLat, maxLat, minLng, maxLng } = query;
  const skip = (page - 1) * limit;

  const whereClause: Prisma.ReportWhereInput = {
    deletedAt: null,
  };

  if (
    minLat !== undefined &&
    maxLat !== undefined &&
    minLng !== undefined &&
    maxLng !== undefined
  ) {
    whereClause.latitude = { gte: minLat, lte: maxLat };
    whereClause.longitude = { gte: minLng, lte: maxLng };
  }

  const [reports, totalReports] = await prisma.$transaction([
    prisma.report.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        reportHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            state: true,
          },
        },
      },
    }),
    prisma.report.count({ where: whereClause }),
  ]);

  return { reports, totalReports, page, limit };
};

export const getMapMarkersService = async (query: GetReportsQueryDTO) => {
  const { minLat, maxLat, minLng, maxLng } = query;

  const whereClause: Prisma.ReportWhereInput = {
    deletedAt: null,
    reportHistory: {
      none: {
        state: {
          name: {
            in: ["Solved", "Rejected", "Duplicated"],
          },
        },
      },
    },
  };

  if (minLat && maxLat && minLng && maxLng) {
    whereClause.latitude = { gte: minLat, lte: maxLat };
    whereClause.longitude = { gte: minLng, lte: maxLng };
  }

  const rawMarkers = await prisma.report.findMany({
    where: whereClause,
    select: {
      id: true,
      latitude: true,
      longitude: true,
      reportHistory: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { state: { select: { name: true, color: true } } },
      },
    },
  });

  const markers = rawMarkers.map((report) => ({
    id: report.id,
    latitude: report.latitude,
    longitude: report.longitude,
    status: report.reportHistory[0]?.state?.name || "Unknown",
    statusColor: report.reportHistory[0]?.state?.color || "Unknown",
  }));

  return markers;
};

export const getReportByIdService = async (reportId: number) => {
  const report = await prisma.report.findFirst({
    where: { id: reportId, deletedAt: null },
    select: {
      id: true,
      address: true,
      latitude: true,
      longitude: true,
      description: true,
      imageUrl: true,
      createdAt: true,
      isAnonymous: true,

      category: {
        select: { name: true },
      },

      user: {
        select: { name: true },
      },

      reportHistory: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          createdAt: true,
          state: {
            select: { name: true, color: true },
          },
        },
      },

      _count: {
        select: { reportAdhesion: true },
      },
    },
  });

  if (!report) throw new AppError("Report not found", 404);

  const mappedReport = {
    id: report.id,
    address: report.address,
    latitude: report.latitude,
    longitude: report.longitude,
    description: report.description,
    imageUrl: report.imageUrl,
    createdAt: report.createdAt,

    category: report.category.name,

    updatedState: report.reportHistory[0]?.createdAt,
    status: report.reportHistory[0]?.state?.name || "Unknown",
    statusColor: report.reportHistory[0]?.state?.color || "#cccccc",

    reporterName: report.isAnonymous ? "Ciudadano Anónimo" : report.user.name,

    adhesionsCount: report._count.reportAdhesion,
  };

  return mappedReport;
};

export const deleteReportByIdService = async (
  reportId: number,
  userId: number,
) => {
  const report = await prisma.report.findFirst({
    where: { id: reportId, userId, deletedAt: null },
    include: {
      reportHistory: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { state: true },
      },
    },
  });

  if (!report) throw new AppError("Only owner can delete this report", 401);

  const currentState = report.reportHistory[0]?.state?.name;

  if (currentState !== "Pending") {
    throw new AppError("Cant delete report in progress", 403);
  }

  await prisma.report.update({
    where: { id: reportId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
};

export const changeStateService = async (
  reportId: number,
  data: ChangeStateDTO,
) => {
  const report = await prisma.report.findFirst({
    where: { id: reportId, deletedAt: null },
  });

  if (!report) throw new AppError("Report not found", 404);

  const newHistory = await prisma.reportHistory.create({
    data: {
      reportId: reportId,
      stateId: data.stateId,
      observation: data.observation || "Cambio administrativo",
    },
    include: {
      state: true,
    },
  });

  return newHistory;
};
