import { prisma } from "../config/prisma.js";
import {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
} from "../utils/appError.js";
import { uploadImageToCloud } from "./cloud.services.js";
import { optimizeImageService } from "./image.services.js";
import { logger } from "../utils/logger.js";

import type {
  ChangeStateDTO,
  CreateReportDTO,
  GetReportsQueryDTO,
} from "../schemas/report.schema.js";
import { Prisma } from "@prisma/client";
import { REPORT_STATES } from "../constants/reportStates.js";
import { publishReportValidation } from "../queues/publishers/reportPublisher.js";
import { notifyReportStatusUpdateService } from "./notification.services.js";

let pendingStateId: number | null = null;

async function getPendingStateId(): Promise<number> {
  if (pendingStateId !== null) return pendingStateId;
  const state = await prisma.reportState.findFirst({
    where: { name: REPORT_STATES.PENDIENTE },
  });
  if (!state) throw new BadRequestError("State 'Pendiente' not found");
  pendingStateId = state.id;
  return pendingStateId;
}

export const createReportService = async (
  data: CreateReportDTO,
  userId: number,
) => {
  const stateId = await getPendingStateId();

  const { buffer: optimizedImage } = await optimizeImageService(
    data.originalBuffer,
  );
  const cloudUrl = await uploadImageToCloud(optimizedImage, data.mimetype);

  const newReport = await prisma.report.create({
    data: {
      address: data.address,
      description: data.description,
      imageUrl: cloudUrl,
      isAnonymous: data.isAnonymous,
      userId: userId,
      categoryId: Number(data.categoryId),
      reportHistory: {
        create: {
          stateId: stateId,
          observation: "Reporte ingresado en el sistema",
        },
      },
    },
  });

  await prisma.$executeRaw`UPDATE \"Report\" SET location = ST_SetSRID(ST_MakePoint(${Number(data.longitude)}, ${Number(data.latitude)}), 4326) WHERE id = ${newReport.id}`;

  await publishReportValidation(newReport.id);

  return newReport;
};

export const getAllReportService = async (query: GetReportsQueryDTO) => {
  const {
    page,
    limit,
    minLat,
    maxLat,
    minLng,
    maxLng,
    categoryId,
    stateId,
    search,
    sortBy,
    sortOrder,
  } = query;
  const skip = (page - 1) * limit;

  // 1. Filtro espacial (Bounding Box)
  let geoIds: number[] | undefined = undefined;
  if (
    minLat !== undefined &&
    maxLat !== undefined &&
    minLng !== undefined &&
    maxLng !== undefined
  ) {
    const rawIds: { id: number }[] = await prisma.$queryRaw`
      SELECT id FROM "Report" 
      WHERE "deletedAt" IS NULL 
      AND location && ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)
    `;
    geoIds = rawIds.map((r) => r.id);
  }

  // 2. Filtro por Estado (Último estado en ReportHistory)
  let stateReportIds: number[] | undefined = undefined;
  if (stateId !== undefined && stateId.length > 0) {
    const matchingStateReports: { reportId: number }[] = await prisma.$queryRaw`
      WITH LatestHistory AS (
        SELECT DISTINCT ON ("reportId") "reportId", "stateId"
        FROM "ReportHistory"
        ORDER BY "reportId", "createdAt" DESC
      )
      SELECT "reportId"
      FROM LatestHistory
      WHERE "stateId" IN (${Prisma.join(stateId)})
    `;
    stateReportIds = matchingStateReports.map((r) => r.reportId);
  }

  // Combinar filtros por ID si existen
  const idFilters: number[][] = [];
  if (geoIds !== undefined) idFilters.push(geoIds);
  if (stateReportIds !== undefined) idFilters.push(stateReportIds);

  let finalIds: number[] | undefined = undefined;
  if (idFilters.length > 0) {
    finalIds = idFilters.reduce((a, b) => a.filter((c) => b.includes(c)));
  }

  const whereClause: Prisma.ReportWhereInput = {
    deletedAt: null,
  };

  if (finalIds !== undefined) {
    whereClause.id = { in: finalIds };
  }

  // 3. Filtro por Categoría
  if (categoryId !== undefined && categoryId.length > 0) {
    whereClause.categoryId = { in: categoryId };
  }

  // 4. Búsqueda por texto (dirección o descripción)
  if (search && search.trim() !== "") {
    const term = search.trim();
    whereClause.OR = [
      { address: { contains: term, mode: "insensitive" } },
      { description: { contains: term, mode: "insensitive" } },
    ];
  }

  // 5. Ordenamiento dinámico
  const orderByClause: Prisma.ReportOrderByWithRelationInput =
    sortBy === "adhesions"
      ? { reportAdhesion: { _count: sortOrder === "asc" ? "asc" : "desc" } }
      : { createdAt: sortOrder === "asc" ? "asc" : "desc" };

  const [reports, totalReports] = await prisma.$transaction([
    prisma.report.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: orderByClause,
      include: {
        category: true,
        reportHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            state: true,
          },
        },
        _count: {
          select: { reportAdhesion: true },
        },
      },
    }),
    prisma.report.count({ where: whereClause }),
  ]);

  const ids = reports.map((r) => r.id);
  let coordsMap = new Map();
  if (ids.length > 0) {
    const rawCoords: { id: number, lat: number, lng: number }[] = await prisma.$queryRaw`SELECT id, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng FROM "Report" WHERE id IN (${Prisma.join(ids)})`;
    coordsMap = new Map(rawCoords.map((c) => [c.id, c]));
  }
  
  const mappedReports = reports.map((r) => {
    const coords = coordsMap.get(r.id);
    return { ...r, latitude: coords?.lat || 0, longitude: coords?.lng || 0 };
  });

  return { reports: mappedReports, totalReports, page, limit };
};

export const getMapMarkersService = async (query: GetReportsQueryDTO) => {
  const { minLat, maxLat, minLng, maxLng, categoryId, stateId } = query;

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
      ? Prisma.sql`AND location && ST_MakeEnvelope(${minLng}, ${minLat}, ${maxLng}, ${maxLat}, 4326)`
      : Prisma.empty;

  const categoryFilter =
    categoryId !== undefined && categoryId.length > 0
      ? Prisma.sql`AND r."categoryId" IN (${Prisma.join(categoryId)})`
      : Prisma.empty;

  const stateFilter =
    stateId !== undefined && stateId.length > 0
      ? Prisma.sql`AND s.id IN (${Prisma.join(stateId)})`
      : Prisma.empty;

  const rawMarkers: any[] = await prisma.$queryRaw`
    WITH LatestHistory AS (
      SELECT DISTINCT ON ("reportId") "reportId", "stateId"
      FROM "ReportHistory"
      ORDER BY "reportId", "createdAt" DESC
    )
    SELECT 
      r.id, 
      ST_Y(r.location::geometry) AS latitude, 
      ST_X(r.location::geometry) AS longitude, 
      s.name AS status, 
      s.color AS "statusColor"
    FROM "Report" r
    INNER JOIN LatestHistory lh ON r.id = lh."reportId"
    INNER JOIN "ReportState" s ON lh."stateId" = s.id
    WHERE r."deletedAt" IS NULL
      AND s.name NOT IN (${Prisma.join(excludedStates)})
      ${geoFilter}
      ${categoryFilter}
      ${stateFilter}
    LIMIT 500
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

  if (!report) throw new NotFoundError("Report not found");

  const rawCoords: { lat: number, lng: number }[] = await prisma.$queryRaw`SELECT ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng FROM \"Report\" WHERE id = ${reportId}`;
  const lat = rawCoords[0]?.lat || 0;
  const lng = rawCoords[0]?.lng || 0;

  const mappedReport = {
    id: report.id,
    address: report.address,
    latitude: lat,
    longitude: lng,
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

  if (!report) throw new UnauthorizedError("Only owner can delete this report");

  const currentState = report.reportHistory[0]?.state?.name;

  if (currentState !== REPORT_STATES.PENDIENTE) {
    throw new ForbiddenError("Cant delete report in progress");
  }

  await prisma.report.update({
    where: { id: reportId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
};

export const changeStateService = async (
  reportId: number,
  data: ChangeStateDTO,
  userId?: number,
) => {
  const report = await prisma.report.findFirst({
    where: { id: reportId, deletedAt: null },
  });

  if (!report) throw new NotFoundError("Report not found");

  const rawCoords: { lat: number, lng: number }[] = await prisma.$queryRaw`SELECT ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng FROM \"Report\" WHERE id = ${reportId}`;
  const lat = rawCoords[0]?.lat || 0;
  const lng = rawCoords[0]?.lng || 0;

  const newHistory = await prisma.reportHistory.create({
    data: {
      reportId: reportId,
      stateId: data.stateId,
      observation: data.observation || "Cambio administrativo",
      userId: userId || null,
    },
    include: {
      state: true,
      user: {
        select: {
          id: true,
          name: true,
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  notifyReportStatusUpdateService(reportId, newHistory.state.name).catch(
    (err) => {
      logger.error(
        "Error enviando notificaciones tras cambio administrativo de estado:",
        err,
      );
    },
  );

  return newHistory;
};

export const getReportsByUserIdService = async (
  userId: number,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const [rawReports, totalReports] = await prisma.$transaction([
    prisma.report.findMany({
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
    }),
    prisma.report.count({
      where: { userId: userId, deletedAt: null },
    })
  ]);

  const formattedReports = rawReports.map((report) => {
    const currentState = report.reportHistory[0]?.state;
    return {
      id: report.id,
      address: report.address,
      createdAt: report.createdAt,
      categoryName: report.category?.name || "Sin categoría",
      stateName: currentState?.name || REPORT_STATES.PENDIENTE,
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

export const getAdheredReportsByUserIdService = async (
  userId: number,
  page: number = 1,
  limit: number = 10,
) => {
  const skip = (page - 1) * limit;

  const [rawReports, totalReports] = await prisma.$transaction([
    prisma.report.findMany({
      where: {
        deletedAt: null,
        reportAdhesion: {
          some: {
            userId: userId,
          },
        },
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
    }),
    prisma.report.count({
      where: {
        deletedAt: null,
        reportAdhesion: {
          some: {
            userId: userId,
          },
        },
      },
    })
  ]);

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

