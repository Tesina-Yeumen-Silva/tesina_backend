import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/config/prisma.js";
import type { Role } from "../src/generated/prisma/client.js";

async function main() {
  console.log("🌱 Iniciando el proceso de seed...");

  const roles = ["user", "admin", "muni"];
  const createdRoles: Record<string, Role> = {};

  for (const roleName of roles) {
    createdRoles[roleName] = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  const reportStates = [
    { name: "Pendiente", color: "#dd3611" },
    { name: "Validado", color: "#e2e60a" },
    { name: "En Progreso", color: "#1a16d8" },
    { name: "Resuelto", color: "#09dd1e" },
    { name: "Duplicado", color: "#940992" },
    { name: "Rechazado", color: "#161716" },
  ];

  for (const state of reportStates) {
    await prisma.reportState.upsert({
      where: { name: state.name },
      update: { color: state.color },
      create: state,
    });
  }

  const categories = [
    { name: "Acequias y Drenajes" },
    { name: "Alumbrado Público" },
    { name: "Arbolado Público" },
    { name: "Baches y Pavimentación" },
    { name: "Limpieza y Residuos" },
    { name: "Plazas y Parques" },
    { name: "Semáforos y Señalización" },
    { name: "Veredas y Accesibilidad" },
    { name: "Agua y Cloacas" },
  ];

  for (const cat of categories) {
    await prisma.reportCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  const passwordHash = await bcrypt.hash("12345678", 10);

  const testUsers = [
    { email: "user@test.com", role: createdRoles.user, name: "Ciudadano Test" },
    { email: "admin@test.com", role: createdRoles.admin, name: "Admin Test" },
    { email: "muni@test.com", role: createdRoles.muni, name: "Municipio Test" },
  ];

  for (const { email, role, name } of testUsers) {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        roleId: role!.id,
        name: name,
      },
    });

    await prisma.authProvider.upsert({
      where: { userId_provider: { userId: user.id, provider: "local" } },
      update: { passwordHash },
      create: { userId: user.id, provider: "local", passwordHash },
    });
  }

  console.log("Seed finalizado con éxito");
}

main()
  .catch((e) => {
    console.error("❌ Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
