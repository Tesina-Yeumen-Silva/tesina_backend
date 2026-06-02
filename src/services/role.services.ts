import { prisma } from "../config/prisma.js";
import type { CreateRoleDTO, UpdateRoleDTO } from "../schemas/role.schema.js";
import { NotFoundError } from "../utils/appError.js";

export const getAllRoleService = async () => {
  const roles = await prisma.role.findMany({
    where: {
      deletedAt: null,
    },
  });

  return roles;
};

export const getRoleByIdService = async (roleId: number) => {
  const role = await prisma.role.findFirst({
    where: { id: roleId, deletedAt: null },
  });

  if (!role) {
    throw new NotFoundError("Role not found");
  }

  return role;
};

export const createRoleService = async (data: CreateRoleDTO) => {
  const newRole = await prisma.role.create({
    data: data,
  });

  return newRole;
};

export const updateRoleService = async (
  roleId: number,
  data: UpdateRoleDTO,
) => {
  const existingRole = await prisma.role.findFirst({
    where: { id: roleId, deletedAt: null },
  });

  if (!existingRole) {
    throw new NotFoundError("Role not found");
  }

  const updatedRole = await prisma.role.update({
    where: { id: roleId },
    data: data,
  });

  return updatedRole;
};

export const deleteRoleByIdService = async (roleId: number) => {
  const existingRole = await prisma.role.findFirst({
    where: { id: roleId, deletedAt: null },
  });

  if (!existingRole) {
    throw new NotFoundError("Role not found");
  }

  await prisma.role.update({
    where: { id: roleId },
    data: {
      deletedAt: new Date(),
    },
  });
};
