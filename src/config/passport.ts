import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "./prisma.js";
import { signAccessToken } from "../utils/jwt.js";
import { generateRefreshTokenService } from "../services/auth.service.js";
import { PROVIDERS } from "../constants/authProviders.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) return done(new Error("Could not obtain the Google email"));
        const name =
          profile.name?.givenName ||
          profile.displayName ||
          email.split("@")[0] ||
          "Usuario";
        const authProvider = await prisma.authProvider.findFirst({
          where: {
            provider: PROVIDERS.GOOGLE,
            providerAccountId: profile.id,
            user: {
              deletedAt: null,
            },
          },
          include: {
            user: {
              include: { role: true },
            },
          },
        });

        if (authProvider) {
          const user = authProvider.user;
          const token = signAccessToken({
            userId: user.id,
            email: user.email,
            role: user.role.name,
          });
          const refreshToken = await generateRefreshTokenService(user!.id);
          return done(null, {
            token,
            refreshToken,
            userId: user.id,
            email: user.email,
            role: user.role.name,
          });
        }

        const defaultRole = await prisma.role.findUnique({
          where: { name: "user" },
        });
        if (!defaultRole) return done(new Error("Default role not found"));

        const newUser = await prisma.$transaction(async (tx) => {
          let user = await tx.user.findFirst({
            where: {
              email,
              deletedAt: null,
            },
          });

          if (!user) {
            user = await tx.user.create({
              data: { email, roleId: defaultRole.id, name },
            });
          }

          await tx.authProvider.create({
            data: {
              userId: user.id,
              provider: PROVIDERS.GOOGLE,
              providerAccountId: profile.id,
            },
          });

          return user;
        });

        const token = signAccessToken({
          userId: newUser.id,
          email: newUser.email,
          role: defaultRole.name,
        });
        const refreshToken = await generateRefreshTokenService(newUser!.id);
        return done(null, {
          token,
          refreshToken,
          userId: newUser.id,
          email: newUser.email,
          role: defaultRole.name,
        });
      } catch (error) {
        return done(error as Error);
      }
    },
  ),
);

export default passport;
