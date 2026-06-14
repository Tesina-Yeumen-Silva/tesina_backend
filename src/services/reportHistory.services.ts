import { id } from "zod/locales";
import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../utils/appError.js";

export const getHistoryByReportIdService = async (reportId: number) => {
  const reportHistory = await prisma.reportHistory.findMany({
    where: { reportId },
    select: {
      id: true,
      reportId: true,
      stateId: true,
      observation: true,
      createdAt: true,
      state: {
        select: {
          id: true,
          name: true,
          color: true,
        },
      },
    },
  });

  if (!reportHistory.length) throw new NotFoundError("Report not found");
  return reportHistory;
};
