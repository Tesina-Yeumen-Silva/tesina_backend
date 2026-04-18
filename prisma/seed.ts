import 'dotenv/config'
import bcrypt from "bcryptjs";
import { prisma } from '../src/config/prisma.js'

async function main() {
    const userRole = await prisma.role.upsert({
        where: {name:"user"},
        update:{},
        create: {name:"user"}
    })

    const adminRole = await prisma.role.upsert({
    where: { name: "admin" },
    update: {},
    create: { name: "admin" },
  });

  const passwordHash = await bcrypt.hash("123456", 10);

  for (const { email, role } of [
    { email: "user@test.com", role: userRole },
    { email: "admin@test.com", role: adminRole },
  ]) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, roleId: role.id,name:"test" },
    });

    await prisma.authProvider.upsert({
      where: { userId_provider: { userId: user.id, provider: "local" } },
      update: {},
      create: { userId: user.id, provider: "local", passwordHash },
    });
  }

  console.log("Roles seeded")
}

main().catch((e) =>{
    console.error(e);
    process.exit(1);
})