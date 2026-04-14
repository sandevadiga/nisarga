import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin123", 10);
  const managerPassword = await bcrypt.hash("manager123", 10);

  await prisma.user.upsert({
    where: { email: "admin@nisarga.com" },
    update: {},
    create: {
      name: "Store Admin",
      email: "admin@nisarga.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@nisarga.com" },
    update: {},
    create: {
      name: "Manager One",
      email: "manager@nisarga.com",
      password: managerPassword,
      role: "MANAGER",
    },
  });

  console.log("Seeded: admin@nisarga.com / admin123");
  console.log("Seeded: manager@nisarga.com / manager123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
