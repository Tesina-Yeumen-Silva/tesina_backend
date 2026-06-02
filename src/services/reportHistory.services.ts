import { id } from "zod/locales"
import { prisma } from "../config/prisma.js"
import { NotFoundError } from "../utils/appError.js"


export const getHistoryByReportIdService = async(reportId:number) => {
    const reportHistory = await prisma.reportHistory.findMany({
        where:{reportId},
        include:{state:true}
    })

    if(!reportHistory) throw new NotFoundError("Report not found");

    return reportHistory;
}