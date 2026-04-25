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

  const muniRole = await prisma.role.upsert({
    where: { name: "muni" },
    update: {},
    create: { name: "muni" },
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
    where: {name:"Pending"},
    update:{},
    create:{name:"Pending", color:"#dd3611"}
  })

  await prisma.reportState.upsert({
    where: {name:"Duplicated"},
    update:{},
    create:{name:"Duplicated", color:"#940992"}
  })

  await prisma.reportState.upsert({
    where: {name:"Rejected"},
    update:{},
    create:{name:"Rejected", color:"#161716"}
  })

  await prisma.reportState.upsert({
    where: {name:"Validated"},
    update:{},
    create:{name:"Validated", color:"#e2e60a"}
  })

  await prisma.reportState.upsert({
    where: {name:"In_progress"},
    update:{},
    create:{name:"In_progress", color:"#1a16d8"}
  })

  await prisma.reportState.upsert({
    where: {name:"Resolved"},
    update:{},
    create:{name:"Resolved", color:"#09dd1e"}
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