import { prisma } from "../lib/prisma";

async function main() {
  const room = await prisma.resource.create({
    data: { name: "Test Room", type: "ROOM" },
  });

  const book = (start: string, end: string) =>
    prisma.reservation.create({
      data: {
        resourceId: room.id,
        bookedBy: "Test User",
        startTime: new Date(start),
        endTime: new Date(end),
      },
    });

  await book("2026-11-01T10:00:00Z", "2026-11-01T11:00:00Z");
  console.log("1. First booking 10:00-11:00: saved ✅");

  try {
    await book("2026-11-01T10:30:00Z", "2026-11-01T11:30:00Z");
    console.log("2. PROBLEM: overlapping booking was saved ❌");
  } catch {
    console.log("2. Overlapping booking 10:30-11:30: rejected ✅");
  }

  await book("2026-11-01T11:00:00Z", "2026-11-01T12:00:00Z");
  console.log("3. Back-to-back booking 11:00-12:00: saved ✅");

  // clean up the test data
  await prisma.reservation.deleteMany({ where: { resourceId: room.id } });
  await prisma.resource.delete({ where: { id: room.id } });
}

main().finally(() => prisma.$disconnect());