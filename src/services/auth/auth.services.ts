import bcrypt from "bcryptjs";
import {prisma} from '../../config/prisma.js';
import { signToken } from "../../utils/jwt.js";
import { AppError } from "../../utils/appError.js";

export async function registerLocal(email:string,password:string){
    const existingUser = await prisma.user.findUnique({where:{email}})
    if(existingUser) throw new AppError("Email already regitered",409);

    const defaultRole = await prisma.role.findUnique({where:{name:"user"}});
    if(!defaultRole) throw new AppError("Default Role not found",409);

    const passwordHash = await bcrypt.hash(password,10);

    const user = await prisma.$transaction(async(tx) => {
        const newUser = await tx.user.create({
            data:{
                email,
                roleId: defaultRole.id
            }
        });

        await tx.authProvider.create({
            data:{
                userId:newUser.id,
                provider:"local",
                passwordHash,
            }
        })

        return newUser
    })

    const token = signToken({ userId: user.id, email: user.email, role: defaultRole.name });

    return {token,user: {id:user.id, email:user.email, role: defaultRole.name}}
}

export async function loginLocal(email:string, password:string){
    const user = await prisma.user.findUnique({
        where: {email, deletedAt:null},
        include:{role:true, authProviders:true}
    });

    if(!user) throw new AppError("Email not registered",401)
    
    const localProvider = user.authProviders.find((p) => p.provider === "local");
    if(!localProvider) throw new AppError("Invalid credentials",401)
    
    const validPassword = await bcrypt.compare(password, localProvider.passwordHash!);
    if(!validPassword) throw new AppError("Invalid password",401)

    const token = signToken({ userId: user.id, email: user.email, role: user.role.name });

    return { token, user: { id: user.id, email: user.email, role: user.role.name } };
}