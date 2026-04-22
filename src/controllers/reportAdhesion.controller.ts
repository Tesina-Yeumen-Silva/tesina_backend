import type { Request,Response } from "express";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

class ReportAdhesionController{
    toggleAdhesion = catchAsync(async(req:Request, res:Response) => {}) 
    getAdhesionsByReportId = catchAsync(async(req:Request, res:Response) => {})
}

export default new ReportAdhesionController()