import { prisma } from "../config/prisma.js";

export const getDashboardMetricsService = async () => {
  const rawStats: any[] = await prisma.$queryRaw`
    WITH LatestHistory AS (
      SELECT DISTINCT ON ("reportId") "reportId", "stateId"
      FROM "ReportHistory"
      ORDER BY "reportId", "createdAt" DESC
    ),
    ResolvedHistory AS (
      SELECT "reportId", MIN("createdAt") as "resolvedAt"
      FROM "ReportHistory" rh
      INNER JOIN "ReportState" rs ON rh."stateId" = rs.id
      WHERE rs.name = 'Resuelto'
      GROUP BY "reportId"
    ),
    AdhesionsCount AS (
      SELECT "reportId", COUNT(id) as "adhesions"
      FROM "ReportAdhesion"
      GROUP BY "reportId"
    )
    SELECT 
      r.id,
      r."createdAt" as "reportDate",
      r.address,
      r."isAnonymous",
      r."categoryId",
      c.name as "categoryName",
      s.name as "stateName",
      res."resolvedAt",
      COALESCE(ac.adhesions, 0) as "adhesions"
    FROM "Report" r
    INNER JOIN LatestHistory lh ON r.id = lh."reportId"
    INNER JOIN "ReportState" s ON lh."stateId" = s.id
    LEFT JOIN "ReportCategory" c ON r."categoryId" = c.id
    LEFT JOIN ResolvedHistory res ON r.id = res."reportId"
    LEFT JOIN AdhesionsCount ac ON r.id = ac."reportId"
    WHERE r."deletedAt" IS NULL
    ORDER BY r."createdAt" DESC
  `;

  let totalReports = 0;
  let totalSolved = 0;
  let totalResolutionTimeHours = 0;
  let solvedWithTimeCount = 0;

  const categoryCounts: Record<string, number> = {};
  const stateCounts: Record<string, number> = {};

  rawStats.forEach((row) => {
    totalReports++;

    const catName = row.categoryName || 'Sin categoría';
    categoryCounts[catName] = (categoryCounts[catName] || 0) + 1;

    const stateName = row.stateName || 'Desconocido';
    stateCounts[stateName] = (stateCounts[stateName] || 0) + 1;

    if (stateName === 'Resuelto') {
      totalSolved++;
    }

    if (row.resolvedAt && row.reportDate) {
      const diffMs = new Date(row.resolvedAt).getTime() - new Date(row.reportDate).getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      if (diffHours >= 0) {
        totalResolutionTimeHours += diffHours;
        solvedWithTimeCount++;
      }
    }
  });

  const averageResolutionTimeHours = solvedWithTimeCount > 0 ? (totalResolutionTimeHours / solvedWithTimeCount) : 0;

  return {
    metrics: {
      totalReports,
      totalSolved,
      averageResolutionTimeHours,
      reportsByCategory: Object.entries(categoryCounts).map(([name, count]) => ({ name, count })),
      reportsByState: Object.entries(stateCounts).map(([name, count]) => ({ name, count })),
    },
    exportData: rawStats.map(r => ({
      id: r.id,
      fechaCreacion: r.reportDate,
      direccion: r.address,
      categoria: r.categoryName,
      estadoActual: r.stateName,
      adhesiones: Number(r.adhesions),
      esAnonimo: r.isAnonymous ? "Sí" : "No",
      fechaResolucion: r.resolvedAt || null,
      horasResolucion: r.resolvedAt && r.reportDate ? ((new Date(r.resolvedAt).getTime() - new Date(r.reportDate).getTime()) / (1000 * 60 * 60)).toFixed(2) : null
    }))
  };
};
