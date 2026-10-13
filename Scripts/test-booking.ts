import { createReservation } from "@/lib/reservation";
import { prisma } from "../lib/prisma";

async function main() {
  const room = await prisma.resource.create({
    data: { name: "Rule Test Room", type: "ROOM", capacity: 10 },
  });

  const base = { resourceId: room.id, purpose: "Test", bookedBy: "Tester" };
  const day = "2026-12-01";

  const tests = [
    ["Valid booking 10:00-11:00", await createReservation({ ...base, date: day, start: "10:00", end: "11:00" })],
    ["Overlap 10:30-11:30", await createReservation({ ...base, date: day, start: "10:30", end: "11:30" })],
    ["Back-to-back 11:00-12:00", await createReservation({ ...base, date: day, start: "11:00", end: "12:00" })],
    ["End before start", await createReservation({ ...base, date: day, start: "14:00", end: "13:00" })],
    ["Outside hours 07:00-08:00", await createReservation({ ...base, date: day, start: "07:00", end: "08:00" })],
    ["In the past", await createReservation({ ...base, date: "2026-01-01", start: "10:00", end: "11:00" })],
    ["Too many attendees (20)", await createReservation({ ...base, date: day, start: "15:00", end: "16:00", attendees: 20 })],
  ] as const;

  for (const [name, result] of tests) {
    console.log(
      result.ok ? "SAVED   " : "REJECTED",
      "|",
      name,
      result.ok ? "" : "-> " + result.error
    );
  }

  // clean up the test data
  await prisma.reservation.deleteMany({ where: { resourceId: room.id } });
  await prisma.resource.delete({ where: { id: room.id } });
}

main().finally(() => prisma.$disconnect());