import type { Request,Response } from "express";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

class ReportHistoryController{
    getAllHistory = catchAsync((req:Request,res:Response) => {})
    getHistoryByReportId = catchAsync((req:Request,res:Response) => {})
}


export default new ReportHistoryController()