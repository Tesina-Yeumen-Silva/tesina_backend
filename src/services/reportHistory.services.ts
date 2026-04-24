import { id } from "zod/locales"
import { prisma } from "../config/prisma.js"
import { AppError } from "../utils/appError.js"


export const getHistoryByReportIdService = async(reportId:number) => {
    const reportHistory = await prisma.reportHistory.findMany({
        where:{reportId},
        include:{state:true}
    })

    if(!reportHistory) throw new AppError("Report not found",404)

    return reportHistory;
}