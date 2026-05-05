import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";
import type {
  confirmPasswordResetDTO,
  LoginLocalDTO,
  RegisterLocalDTO,
  RequestPasswordResetDTO,
} from "../schemas/auth.schema.js";
import { sendPasswordReset } from "./emailServices.js";
import { PROVIDERS } from "../constants/authProviders.js";

export async function generateRefreshTokenService(userId: number) {
  const token = signRefreshToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: { token, userId, expiresAt },
  });

  return token;
}

export async function refreshAccessTokenService(refreshToken: string) {
  const stored = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: { include: { role: true } } },
  });

  if (!stored) throw new AppError("Refresh token invalid", 401);
  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    throw new AppError("Refresh token expired", 401);
  }

  const accessToken = signAccessToken({
    userId: stored.user.id,
    email: stored.user.email,
    role: stored.user.role.name,
  });

  return { accessToken };
}

export async function logoutService(refreshToken: string) {
  await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
}

export async function requestPasswordResetService(
  data: RequestPasswordResetDTO,
) {
  const user = await prisma.user.findFirst({
    where: { email: data.email, deletedAt: null },
    include: { authProviders: true },
  });

  if (!user) throw new AppError("User not found", 404);

  const hasLocalProvider = user.authProviders.some(
    (p) => p.provider === PROVIDERS.LOCAL,
  );
  if (!hasLocalProvider) throw new AppError("Dont have local acount", 400);

  const randomNumber = crypto.randomInt(0, 1000000);
  const token = randomNumber.toString().padStart(6, "0");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15);

  await prisma.passwordResetToken.deleteMany({
    where: { userId: user.id },
  });

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt,
    },
  });
  await sendPasswordReset(user.email, token);
}

export async function confirmPasswordResetService(
  data: confirmPasswordResetDTO,
) {
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: { token: data.code },
  });

  if (!resetToken) throw new AppError("Invalid Token", 400);
  if (resetToken.expiresAt < new Date())
    throw new AppError("Expired Token", 400);

  const user = await prisma.user.findFirst({
    where: { email: data.email, deletedAt: null },
  });

  if (!user) throw new AppError("User not found", 404);
  if (resetToken.userId !== user.id) throw new AppError("Invalid Token", 400);

  const hashedPassword = await bcrypt.hash(data.newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      authProviders: {
        update: {
          where: {
            userId_provider: {
              userId: user.id,
              provider: PROVIDERS.LOCAL,
            },
          },
          data: { passwordHash: hashedPassword },
        },
      },
    },
  });

  await prisma.passwordResetToken.delete({
    where: { id: resetToken.id },
  });
}

export async function registerLocalService(data: RegisterLocalDTO) {
  const { email, password, name, roleId = 1 } = data;

  const existingUser = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });
  if (existingUser) throw new AppError("Email already registered", 409);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      role: { connect: { id: roleId } },
      authProviders: {
        create: {
          provider: PROVIDERS.LOCAL,
          passwordHash,
        },
      },
    },
    include: { role: true },
  });

  const token = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role.name,
  });
  const refreshToken = await generateRefreshTokenService(user.id);

  return {
    token,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role.name },
  };
}

export async function loginLocalService(data: LoginLocalDTO) {
  const { email, password } = data;

  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
    include: {
      role: true,
      authProviders: { where: { provider: PROVIDERS.LOCAL } },
    },
  });

  if (!user || user.authProviders.length === 0) {
    throw new AppError("Invalid email or password", 401);
  }

  const localProvider = user.authProviders[0];
  if (localProvider) {
    const validPassword = await bcrypt.compare(
      password,
      localProvider.passwordHash!,
    );
    if (!validPassword) throw new AppError("Invalid email or password", 401);
  }

  const token = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role.name,
  });
  const refreshToken = await generateRefreshTokenService(user.id);

  return {
    token,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role.name },
  };
}
