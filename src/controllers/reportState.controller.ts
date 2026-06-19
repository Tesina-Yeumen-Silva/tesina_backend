import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync.js";
import { sendResponse } from "../utils/response.js";
import {
  createStateService,
  deleteStateByIdService,
  getAllStatesServices,
  getStateByIdService,
  updatedStateService,
} from "../services/reportState.services.js";
import type {
  CreateStateDTO,
  UpdateStateDTO,
} from "../schemas/state.schema.js";

export const createState = catchAsync(async (req: Request, res: Response) => {
  const data: CreateStateDTO = req.body;
  const newState = await createStateService(data);
  sendResponse(res, 201, "State created successfully", newState);
});

export const getAllStates = catchAsync(async (req: Request, res: Response) => {
  const states = await getAllStatesServices();
  sendResponse(res, 200, "States retrieved successfully", states);
});

export const getStateById = catchAsync(async (req: Request, res: Response) => {
  const stateId = Number(req.params.stateId);
  const state = await getStateByIdService(stateId);
  sendResponse(res, 200, "State retrieved successfully", state);
});

export const updateState = catchAsync(async (req: Request, res: Response) => {
  const stateId = Number(req.params.stateId);
  const data: UpdateStateDTO = req.body;

  const updatedState = await updatedStateService(stateId, data);
  sendResponse(res, 200, "State updated successfully", updatedState);
});

export const deleteStateById = catchAsync(async (req: Request, res: Response) => {
  const stateId = Number(req.params.stateId);
  await deleteStateByIdService(stateId);
  sendResponse(res, 200, "State deleted successfully");
});
