import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { ConflictError, NotFoundError } from "../utils/appError.js";
import type {
  UpdateUserDTO,
  UpdatePasswordDTO,
  CreateUserDTO,
} from "../schemas/user.schema.js";
import { PROVIDERS } from "../constants/authProviders.js";

export const createUserService = async (data: CreateUserDTO) => {
  const existingUser = await prisma.user.findFirst({
    where: { email: data.email, deletedAt: null },
  });

  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      role: {
        connect: { id: data.roleId },
      },
      authProviders: {
        create: {
          provider: PROVIDERS.LOCAL,
          passwordHash: passwordHash,
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
      roleId: true,
      createdAt: true,
    },
  });

  return newUser;
};

export const savePushTokenService = async (userId: number, token: string) => {
  return await prisma.pushToken.upsert({
    where: { token },
    update: { userId },
    create: { token, userId },
  });
};

export const getAllUsersService = async () => {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      roleId: true,
      createdAt: true,
    },
  });

  return users;
};

export const getUserByIdService = async (userId: number) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: {
      id: true,
      email: true,
      name: true,
      roleId: true,
      createdAt: true,
    },
  });

  if (!user) throw new NotFoundError("User not found");

  return user;
};

export const updatedUserService = async (
  userId: number,
  data: UpdateUserDTO,
) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });

  if (!user) throw new NotFoundError("User not found");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: data,
  });

  return updatedUser;
};

export const updatePasswordService = async (
  userId: number,
  data: UpdatePasswordDTO,
) => {
  const provider = await prisma.authProvider.findFirst({
    where: { userId, provider: PROVIDERS.LOCAL },
  });

  if (!provider) throw new NotFoundError("User not found");

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.authProvider.update({
    where: { id: provider.id },
    data: { passwordHash: passwordHash },
  });
};

export const deleteUserByIdService = async (userId: number) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
  });

  if (!user) throw new NotFoundError("User not found");

  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() },
  });
};

export const getUserByEmailService = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });

  if (!user) throw new NotFoundError("User not found");

  return user;
};
