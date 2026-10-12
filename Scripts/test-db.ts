import { prisma } from "../lib/prisma";

async function main() {
  const result = await prisma.$queryRaw`SELECT version()`;
  console.log("Connected!", result);
}

main().finally(() => prisma.$disconnect());