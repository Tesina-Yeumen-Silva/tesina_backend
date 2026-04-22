import { catchAsync } from "../utils/catchAsync.js";
import type { Request,Response } from "express";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/appError.js";

    export const createState = catchAsync(async(req:Request,res:Response) =>{
        const {name,color} = req.body;

        const newState = await prisma.reportState.create({
            data:{name,color}
        })

        res.status(201).json({
            message: "State created",
            data: newState
        });
    })

    export const getAllStates = catchAsync(async(req:Request,res:Response) =>{
        const states = await prisma.reportState.findMany({
            where:{deletedAt:null}
        }) 

        res.status(200).json({ data: states });
    })
    
    export const getStateById = catchAsync(async(req:Request,res:Response) =>{
        const stateId = Number(req.params.stateId);

        const state = await prisma.reportState.findFirst({
            where:{id:stateId,deletedAt:null}
        })

        if (!state) throw new AppError("State not found", 404);

    
        res.status(200).json({ data: state });
        
    })

    export const updateState = catchAsync(async(req:Request,res:Response) =>{
        const stateId = Number(req.params.stateId);
        const {name,color} = req.body;

        const state = await prisma.reportState.findFirst({
            where:{id:stateId,deletedAt:null}
        })

        if (!state) throw new AppError("State not found", 404);

        const updatedState = await prisma.reportState.update({
            where:{id:stateId, deletedAt:null},
            data:{name,color}
        })

        res.status(200).json({
            message: "State updated successfully",
            data: updatedState
        });
    })

    export const deleteStateById = catchAsync(async(req:Request,res:Response) =>{
        const stateId = Number(req.params.stateId);

        const state = await prisma.reportState.findFirst({
            where:{id:stateId,deletedAt:null}
        })

        if (!state) throw new AppError("State not found", 404);

        await prisma.reportState.update({
            where:{id:stateId, deletedAt:null},
            data:{deletedAt: new Date()}
        })

        res.status(200).json({
            message: "State deleted successfully",
        });

    })

