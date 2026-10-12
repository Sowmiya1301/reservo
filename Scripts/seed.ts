import { prisma } from "../lib/prisma";

async function main() {
  await prisma.resource.createMany({
    data: [
      { name: "Board Room A", type: "ROOM", capacity: 12, location: "Floor 3" },
      { name: "Meeting Room B", type: "ROOM", capacity: 6, location: "Floor 2" },
      { name: "Projector 1", type: "EQUIPMENT", location: "IT store" },
      { name: "Company Van", type: "VEHICLE", capacity: 8, location: "Parking" },
    ],
  });
  console.log("Seeded 4 resources");
}

main().finally(() => prisma.$disconnect());