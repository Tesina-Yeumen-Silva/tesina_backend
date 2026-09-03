import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../utils/appError.js";

export const getHistoryByReportIdService = async (reportId: number) => {
  const reportHistory = await prisma.reportHistory.findMany({
    where: { reportId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      reportId: true,
      stateId: true,
      observation: true,
      createdAt: true,
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
      state: {
        select: {
          name: true,
          color: true,
        },
      },
    },
  });

  if (!reportHistory.length) throw new NotFoundError("Report not found");
  return reportHistory;
};
