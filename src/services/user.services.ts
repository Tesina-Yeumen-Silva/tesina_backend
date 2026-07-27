import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { ConflictError, NotFoundError, ForbiddenError } from "../utils/appError.js";
import type {
  UpdateUserDTO,
  UpdatePasswordDTO,
  CreateUserDTO,
  GetUsersQueryDTO,
} from "../schemas/user.schema.js";
import { PROVIDERS } from "../constants/authProviders.js";
import { ROLES } from "../constants/roles.js";

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

export const getAllUsersService = async (
  query: GetUsersQueryDTO,
  requestingUserRole?: string,
) => {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 20);
  const { search, role } = query;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    deletedAt: null,
  };

  // Restricción: El rol "muni" SOLO puede visualizar a los usuarios ciudadanos ("user")
  if (requestingUserRole === ROLES.MUNI) {
    whereClause.role = {
      name: ROLES.USER,
    };
  } else if (role && (role as unknown) !== "all") {
    const roleVal = role as string | string[];
    const rolesList: string[] = Array.isArray(roleVal)
      ? roleVal
      : typeof roleVal === "string"
      ? roleVal.split(",").map((r: string) => r.trim())
      : [];

    if (rolesList.length > 0) {
      whereClause.role = { name: { in: rolesList } };
    }
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const [users, totalUsers] = await prisma.$transaction([
    prisma.user.findMany({
      where: whereClause,
      skip: skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        createdAt: true,
        role: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.user.count({
      where: whereClause,
    }),
  ]);

  return { users, totalUsers, page, limit };
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
  requestingUserRole?: string,
) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { role: true },
  });

  if (!user) throw new NotFoundError("User not found");

  // Restricción: Los usuarios ciudadanos no son editables
  if (user.role?.name === ROLES.USER) {
    throw new ForbiddenError("Los usuarios ciudadanos no son editables.");
  }

  // Restricción: El rol muni no puede editar administradores
  if (requestingUserRole === ROLES.MUNI && user.role?.name === ROLES.ADMIN) {
    throw new ForbiddenError("No tienes permisos para modificar administradores.");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: data,
  });

  return updatedUser;
};

export const updatePasswordService = async (
  userId: number,
  data: UpdatePasswordDTO,
  requestingUserRole?: string,
) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { role: true },
  });

  if (!user) throw new NotFoundError("Usuario no encontrado.");

  if (requestingUserRole === ROLES.MUNI && user.role?.name === ROLES.ADMIN) {
    throw new ForbiddenError("No tienes permisos para modificar administradores.");
  }

  const provider = await prisma.authProvider.findFirst({
    where: { userId, provider: PROVIDERS.LOCAL },
  });

  if (!provider) throw new NotFoundError("El usuario no posee cuenta de acceso local.");

  const passwordHash = await bcrypt.hash(data.password, 10);

  await prisma.authProvider.update({
    where: { id: provider.id },
    data: { passwordHash: passwordHash },
  });
};

export const deleteUserByIdService = async (
  userId: number,
  requestingUserRole?: string,
) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    include: { role: true },
  });

  if (!user) throw new NotFoundError("User not found");

  // Restricción: Los usuarios ciudadanos no son eliminables
  if (user.role?.name === ROLES.USER) {
    throw new ForbiddenError("Los usuarios ciudadanos no pueden ser eliminados.");
  }

  // Restricción: El rol muni no puede eliminar administradores
  if (requestingUserRole === ROLES.MUNI && user.role?.name === ROLES.ADMIN) {
    throw new ForbiddenError("No tienes permisos para eliminar administradores.");
  }

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
