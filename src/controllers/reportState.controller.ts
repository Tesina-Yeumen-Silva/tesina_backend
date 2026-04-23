import { catchAsync } from "../utils/catchAsync.js";
import type { Request, Response } from "express";
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

  res.status(201).json({
    message: "State created",
    data: newState,
  });
});

export const getAllStates = catchAsync(async (req: Request, res: Response) => {
  const states = await getAllStatesServices();

  res.status(200).json({ data: states });
});

export const getStateById = catchAsync(async (req: Request, res: Response) => {
  const stateId = Number(req.params.stateId);

  const state = await getStateByIdService(stateId);

  res.status(200).json({ data: state });
});

export const updateState = catchAsync(async (req: Request, res: Response) => {
  const stateId = Number(req.params.stateId);
  const data: UpdateStateDTO = req.body;

  const updatedState = await updatedStateService(stateId, data);

  res.status(200).json({
    message: "State updated successfully",
    data: updatedState,
  });
});

export const deleteStateById = catchAsync(
  async (req: Request, res: Response) => {
    const stateId = Number(req.params.stateId);

    await deleteStateByIdService(stateId);

    res.status(200).json({
      message: "State deleted successfully",
    });
  },
);
