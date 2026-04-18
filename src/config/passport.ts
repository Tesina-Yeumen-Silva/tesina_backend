import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from './prisma.js';
import { signAccessToken } from "../utils/jwt.js";
import { generateRefreshToken } from "../services/auth.service.js";

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
                const name = profile.name?.givenName;
                if (!email) return done(new Error("Could not obtain the Google email"));

                const authProvider = await prisma.authProvider.findFirst({
                    where: { 
                        provider: "google", 
                        providerAccountId: profile.id,
                        user: {
                            deletedAt: null 
                        }
                    },
                    include: { 
                        user: {
                            include: { role: true }
                        }
                    }
                });

                if (authProvider) {
                    const user = authProvider.user;
                    const token = signAccessToken({ userId: user.id, email: user.email, role: user.role.name });
                    const refreshToken = await generateRefreshToken(user!.id);
                    return done(null, { token, refreshToken, user: { id: user.id, email: user.email, role: user.role.name } });
                }

                const defaultRole = await prisma.role.findUnique({ where: { name: "user" } });
                if (!defaultRole) return done(new Error("Default role not found"));

                const newUser = await prisma.$transaction(async (tx) => {
                    
                    let user = await tx.user.findFirst({ 
                        where: { 
                            email,
                            deletedAt: null 
                        } 
                    });

                    if (!user) {
                        user = await tx.user.create({
                            data: { email, roleId: defaultRole.id, name }
                        });
                    }

                    await tx.authProvider.create({
                        data: {
                            userId: user.id,
                            provider: "google",
                            providerAccountId: profile.id
                        }
                    });

                    return user;
                });

                const token = signAccessToken({ userId: newUser.id, email: newUser.email, role: defaultRole.name });
                const refreshToken = await generateRefreshToken(newUser!.id);
                return done(null, { token, refreshToken, user: { id: newUser.id, email: newUser.email, role: defaultRole.name } });
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

export default passport;