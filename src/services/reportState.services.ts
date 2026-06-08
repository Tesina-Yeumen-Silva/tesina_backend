import { prisma } from "../config/prisma.js";
import { NotFoundError } from "../utils/appError.js";
import type {
  UpdateStateDTO,
  CreateStateDTO,
} from "../schemas/state.schema.js";

export const createStateService = async (data: CreateStateDTO) => {
  const newState = await prisma.reportState.create({
    data: data,
  });

  return newState;
};
export const getAllStatesServices = async () => {
  const allStates = await prisma.reportState.findMany({
    where: { deletedAt: null },
  });

  return allStates;
};
export const getStateByIdService = async (stateId: number) => {
  const state = await prisma.reportState.findFirst({
    where: { id: stateId, deletedAt: null },
  });

  if (!state) throw new NotFoundError("State not found");

  return state;
};

export const updatedStateService = async (
  stateId: number,
  data: UpdateStateDTO,
) => {
  const state = await prisma.reportState.findFirst({
    where: { id: stateId, deletedAt: null },
  });

  if (!state) throw new NotFoundError("State not found");

  const updatedState = await prisma.reportState.update({
    where: { id: stateId, deletedAt: null },
    data: data,
  });

  return updatedState;
};
export const deleteStateByIdService = async (stateId: number) => {
  const state = await prisma.reportState.findFirst({
    where: { id: stateId, deletedAt: null },
  });

  if (!state) throw new NotFoundError("State not found");

  await prisma.reportState.update({
    where: { id: stateId, deletedAt: null },
    data: { deletedAt: new Date() },
  });
};
