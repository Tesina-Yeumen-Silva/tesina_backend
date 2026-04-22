import type { Request,Response } from "express";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

class ReportController{

    createReport = catchAsync(async(req:Request,res:Response) => {})
    getAllReport = catchAsync(async(req:Request,res:Response) => {})
    getReportById = catchAsync(async(req:Request,res:Response) => {})
    updateReport = catchAsync(async(req:Request,res:Response) => {})
    deleteReportById = catchAsync(async(req:Request,res:Response) => {})
    changeState = catchAsync((req:Request,res:Response) => {})

}

export default new ReportController();