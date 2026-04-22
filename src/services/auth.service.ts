import bcrypt from "bcryptjs";
import { prisma } from '../config/prisma.js';
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";

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

  if (!stored) throw new AppError("Refresh token inválido", 401);
  if (stored.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    throw new AppError("Refresh token expirado", 401);
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

export async function registerLocalService(email: string, password: string, name: string,roleId:number=1) {
    const existingUser = await prisma.user.findFirst({ 
        where: { email, deletedAt: null } 
    });
    if (existingUser) throw new AppError("Email already registered", 409);

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            email,
            name,
            role: { 
                connect: { id:roleId } 
            },
            authProviders: {
                create: {
                    provider: "local",
                    passwordHash
                }
            }
        },
        include: {
            role: true 
        }
    });

    const token = signAccessToken({ userId: user.id, email: user.email, role: user.role.name });
    const refreshToken = await generateRefreshTokenService(user.id);

    return { token, refreshToken, user: { id: user.id, email: user.email, role: user.role.name } };
}

export async function loginLocalService(email: string, password: string) {
    const user = await prisma.user.findFirst({
        where: { email, deletedAt: null },
        include: {
            role: true,
            authProviders: {
                where: { provider: "local" }
            }
        }
    });

    if (!user || user.authProviders.length === 0) {
        throw new AppError("Invalid email or password", 401);
    }
    
    const localProvider = user.authProviders[0];
    if(localProvider){
        const validPassword = await bcrypt.compare(password, localProvider.passwordHash!);
        if (!validPassword) throw new AppError("Invalid email or password", 401);
    }
    

    const token = signAccessToken({ userId: user.id, email: user.email, role: user.role.name });
    const refreshToken = await generateRefreshTokenService(user.id);
    return { token, refreshToken, user: { id: user.id, email: user.email, role: user.role.name } };
}