import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";
import { uploadImageToCloud } from "./cloud.services.js";
import { optimizeImageService } from "./image.services.js";
import type{ CreateReportDTO } from "../schemas/report.schema.js";


export const createReportService = async (data: CreateReportDTO) => {
    const createdState = await prisma.reportState.findFirst({
        where: { name: "Pending" }
    });

    if(!createdState) throw new AppError("State not found", 400);

    const { buffer: optimizedImage } = await optimizeImageService(data.originalBuffer);
    const cloudUrl = await uploadImageToCloud(optimizedImage, data.mimetype);
        
    const newReport = await prisma.report.create({
        data: {
            address: data.address,
            latitude: Number(data.latitude),
            longitude: Number(data.longitude),
            description: data.description,
            imageUrl: cloudUrl,
            isAnonymous: data.isAnonymous,
            userId: Number(data.userId),
            categoryId: Number(data.categoryId),
            reportHistory: {
                create: {
                    stateId: createdState.id,
                    observation: "Reporte ingresado en el sistema"
                }
            }
        }
    });

    return newReport;
};

export const getAllReportService = async() => {}

export const getReportByIdService = async() => {}

export const updateReportService = async() => {}

export const deleteReportByIdService = async() => {}

export const changeStateService = () => {}