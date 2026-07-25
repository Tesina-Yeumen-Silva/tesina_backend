import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import {
  signAccessToken,
  signRefreshToken,
  signRegisterToken,
  verifyRegisterToken,
} from "../utils/jwt.js";
import {
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
  ConflictError,
} from "../utils/appError.js";
import type {
  confirmPasswordResetDTO,
  LoginLocalDTO,
  RegisterLocalDTO,
  RequestPasswordResetDTO,
  ConfirmRegisterDTO,
} from "../schemas/auth.schema.js";
import { sendPasswordReset, sendRegisterCode } from "./emailServices.js";
import { PROVIDERS } from "../constants/authProviders.js";
import { generateVerificationCode } from "../utils/crypto.js";

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

  if (!stored) throw new UnauthorizedError("Refresh token invalid");
  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    throw new UnauthorizedError("Refresh token expired");
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

  if (!user) throw new NotFoundError("User not found");

  const hasLocalProvider = user.authProviders.some(
    (p) => p.provider === PROVIDERS.LOCAL,
  );
  if (!hasLocalProvider) throw new BadRequestError("Dont have local acount");

  const token = generateVerificationCode();
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

  if (!resetToken) throw new BadRequestError("Invalid Token");
  if (resetToken.expiresAt < new Date())
    throw new BadRequestError("Expired Token");

  const user = await prisma.user.findFirst({
    where: { email: data.email, deletedAt: null },
  });

  if (!user) throw new NotFoundError("User not found");
  if (resetToken.userId !== user.id) throw new BadRequestError("Invalid Token");

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
  if (existingUser) throw new ConflictError("Email already registered");

  const passwordHash = await bcrypt.hash(password, 10);

  const code = generateVerificationCode();

  const signupToken = signRegisterToken({
    email,
    name,
    passwordHash,
    roleId,
    code,
  });

  await sendRegisterCode(email, code);

  return { signupToken };
}

export async function confirmRegisterService(data: ConfirmRegisterDTO) {
  const { email, code, signupToken } = data;

  let payload;
  try {
    payload = verifyRegisterToken(signupToken);
  } catch (err) {
    throw new BadRequestError("Token de registro inválido o expirado");
  }

  if (payload.email !== email || payload.code !== code) {
    throw new BadRequestError(
      "Código de validación incorrecto o el email no coincide",
    );
  }

  const existingUser = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  });
  if (existingUser) throw new ConflictError("Email ya registrado");

  const user = await prisma.user.create({
    data: {
      email,
      name: payload.name,
      role: { connect: { id: payload.roleId } },
      authProviders: {
        create: {
          provider: PROVIDERS.LOCAL,
          passwordHash: payload.passwordHash,
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
    throw new UnauthorizedError("Invalid email or password");
  }

  const localProvider = user.authProviders[0];
  if (localProvider) {
    const validPassword = await bcrypt.compare(
      password,
      localProvider.passwordHash!,
    );
    if (!validPassword)
      throw new UnauthorizedError("Invalid email or password");
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
