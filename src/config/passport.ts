import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {prisma} from './prisma.js'
import { signToken } from "../utils/jwt.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
        },
        async (_accessToken,_refreshToken,profile,done) => {
            try {
                const email = profile.emails?.[0]?.value;
                if(!email) return done(new Error("Could not obtain the Google email"));

                let authProvider = await prisma.authProvider.findUnique({
                    where:{
                        userId_provider:{
                            userId:0,
                            provider:"google"
                        }
                    }
                });

                authProvider = await prisma.authProvider.findFirst({
                    where: {provider:"google", providerAccountId:profile.id},
                    include: {user:true}
                })

                if(authProvider){
                    const user = await prisma.user.findUnique({
                        where: {id:authProvider.userId},
                        include: {role:true}
                    })

                    const token =  signToken({ userId: user!.id, email: user!.email, role: user!.role.name });
                    return done(null, { token, user: { id: user!.id, email: user!.email, role: user!.role.name } });
                }

                const defaultRole = await prisma.role.findUnique({where: {name:"user"}})
                if(!defaultRole) return done(new Error("Default role not found"));

                const newUser = await prisma.$transaction(async(tx) => {
                    let user = await tx.user.findUnique({where: {email}})

                    if(!user){
                        user = await tx.user.create({
                            data: {email,roleId:defaultRole.id}
                        })
                    }

                    await tx.authProvider.create({
                        data: {
                            userId: user.id,
                            provider:"google",
                            providerAccountId:profile.id
                        }
                    })

                    return user;
                })

                const token = signToken({ userId: newUser.id, email: newUser.email, role: defaultRole.name });
                return done(null, { token, user: { id: newUser.id, email: newUser.email, role: defaultRole.name } });
            } catch (error) {
                return done(error as Error);
            }
        }
    )
)


export default passport;