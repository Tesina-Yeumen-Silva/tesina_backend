import type { Request,Response } from "express";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

    export const getAllHistory = catchAsync((req:Request,res:Response) => {})
    export const getHistoryByReportId = catchAsync((req:Request,res:Response) => {})
