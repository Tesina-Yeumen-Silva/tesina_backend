import { prisma } from "../config/prisma.js"
import { NotFoundError, BadRequestError } from "../utils/appError.js"


export const toggleAdhesionService = async (reportId: number, userId: number) => {
    const report = await prisma.report.findFirst({
        where: { id: reportId, deletedAt: null }
    });

    if (!report) {
        throw new NotFoundError("El reporte no existe");
    }

    if(userId === report.userId) throw new BadRequestError("You cant adhere your own report");

    const existingAdhesion = await prisma.reportAdhesion.findFirst({
        where: {
            reportId: reportId,
            userId: userId
        }
    });

    if (existingAdhesion) {
        await prisma.reportAdhesion.delete({
            where: { id: existingAdhesion.id }
        });
        
        return { adhered: false };
    } else {
        await prisma.reportAdhesion.create({
            data: {
                reportId: reportId,
                userId: userId
            }
        });
        
        return { adhered: true };
    }
};

export const getAdhesionsByReportIdService = async(reportId:number) => {
    const users = await prisma.report.findFirst({
        where:{id:reportId},
        select:{
            reportAdhesion:true
        }
    })

    if(!users) throw new NotFoundError("Users not found");
    
    return users;
}