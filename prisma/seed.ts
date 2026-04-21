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

  await prisma.reportCategory.upsert({
    where: {name:"acequia"},
    update:{},
    create:{name:"acequia"}
  })

  await prisma.reportCategory.upsert({
    where: {name:"bache"},
    update:{},
    create:{name:"bache"}
  })

  await prisma.reportCategory.upsert({
    where: {name:"arbol"},
    update:{},
    create:{name:"arbol"}
  })

  await prisma.reportCategory.upsert({
    where: {name:"basura"},
    update:{},
    create:{name:"basura"}
  })

  await prisma.reportState.upsert({
    where: {name:"Reported"},
    update:{},
    create:{name:"Reported", color:"#f2931f"}
  })

  await prisma.reportState.upsert({
    where: {name:"In process"},
    update:{},
    create:{name:"In process", color:"#f2f213"}
  })

  await prisma.reportState.upsert({
    where: {name:"Solved"},
    update:{},
    create:{name:"Solved", color:"#13f213"}
  })

  await prisma.reportState.upsert({
    where: {name:"Bad report"},
    update:{},
    create:{name:"Bad report", color:"#cf3719"}
  })

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