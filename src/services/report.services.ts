import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { uploadImageToCloud } from "./cloud.services.js";
import { optimizeImageService } from "./image.services.js";
import type {
  ChangeStateDTO,
  CreateReportDTO,
  GetReportsQueryDTO,
} from "../schemas/report.schema.js";
import { Prisma } from "../generated/prisma/index.js";
import { REPORT_STATES } from "../constants/reportStates.js";
import { publishReportValidation } from "../queues/publishers/reportPublisher.js";

export const createReportService = async (
  data: CreateReportDTO,
  userId: number,
) => {
  const createdState = await prisma.reportState.findFirst({
    where: { name: REPORT_STATES.PENDIENTE },
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

  await publishReportValidation(newReport.id);

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

  const excludedStates = [
    REPORT_STATES.PENDIENTE,
    REPORT_STATES.RECHAZADO,
    REPORT_STATES.DUPLICADO,
  ];

  const geoFilter =
    minLat !== undefined &&
    maxLat !== undefined &&
    minLng !== undefined &&
    maxLng !== undefined
      ? Prisma.sql`AND r.latitude >= ${minLat} AND r.latitude <= ${maxLat} AND r.longitude >= ${minLng} AND r.longitude <= ${maxLng}`
      : Prisma.empty;

  const rawMarkers: any[] = await prisma.$queryRaw`
    WITH LatestHistory AS (
      SELECT DISTINCT ON ("reportId") "reportId", "stateId"
      FROM "ReportHistory"
      ORDER BY "reportId", "createdAt" DESC
    )
    SELECT 
      r.id, 
      r.latitude, 
      r.longitude, 
      s.name AS status, 
      s.color AS "statusColor"
    FROM "Report" r
    INNER JOIN LatestHistory lh ON r.id = lh."reportId"
    INNER JOIN "ReportState" s ON lh."stateId" = s.id
    WHERE r."deletedAt" IS NULL
      AND s.name NOT IN (${Prisma.join(excludedStates)})
      -- Insertamos las coordenadas si existen
      ${geoFilter}
  `;

  const markers = rawMarkers.map((marker) => ({
    id: marker.id,
    latitude: Number(marker.latitude),
    longitude: Number(marker.longitude),
    status: marker.status || "Unknown",
    statusColor: marker.statusColor || "Unknown",
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

export const getReportsByUserIdService = async (
  userId: number,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const rawReports = await prisma.report.findMany({
    where: {
      userId: userId,
      deletedAt: null,
    },
    orderBy: { createdAt: "desc" },
    skip: skip,
    take: limit,
    select: {
      id: true,
      address: true,
      createdAt: true,
      category: { select: { name: true } },
      reportHistory: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: {
          state: { select: { name: true, color: true } },
        },
      },
    },
  });

  const totalReports = await prisma.report.count({
    where: { userId: userId, deletedAt: null },
  });

  const formattedReports = rawReports.map((report) => {
    const currentState = report.reportHistory[0]?.state;
    return {
      id: report.id,
      address: report.address,
      createdAt: report.createdAt,
      categoryName: report.category?.name || "Sin categoría",
      stateName: currentState?.name || "Pendiente",
      stateColor: currentState?.color || "#9E9E9E",
    };
  });

  return {
    reports: formattedReports,
    meta: {
      total: totalReports,
      page: page,
      limit: limit,
      hasMore: page * limit < totalReports,
    },
  };
};
