import { prisma } from "../config/prisma.js"
import { AppError } from "../utils/appError.js"


export const createStateService = async(name:string,color:string) => {
    const newState = await prisma.reportState.create({
        data:{name,color}
    })

    return newState
}
export const getAllStatesServices = async() => {
    const allStates = await prisma.reportState.findMany({
        where:{deletedAt:null}
    })

    return allStates
}
export const getStateByIdService = async(stateId:number) => {
    const state = await prisma.reportState.findFirst({
        where:{id:stateId,deletedAt:null}
    })
    
    if (!state) throw new AppError("State not found", 404);

    return state
}

export const updatedStateService = async(stateId:number,name:string,color:string) => {
    const state = await prisma.reportState.findFirst({
        where:{id:stateId,deletedAt:null}
    })
    
    if (!state) throw new AppError("State not found", 404);
    
    const updatedState = await prisma.reportState.update({
        where:{id:stateId, deletedAt:null},
        data:{name,color}
    })

    return updatedState
}
export const deleteStateByIdService = async(stateId:number) => {

    const state = await prisma.reportState.findFirst({
        where:{id:stateId,deletedAt:null}
    })

    if (!state) throw new AppError("State not found", 404);

    await prisma.reportState.update({
        where:{id:stateId, deletedAt:null},
        data:{deletedAt: new Date()}
    })

    
}
