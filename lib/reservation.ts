import { prisma } from "./prisma";
import { CLOSE_MIN, OPEN_MIN, formatTime, toDate, toMinutes } from "./time";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export type BookingInput = {
  resourceId: string;
  date: string; // "2026-12-01"
  start: string; // "10:00"
  end: string; // "11:30"
  purpose: string;
  bookedBy: string;
  attendees?: number | null;
  notes?: string | null;
};

export type BookingResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

const fail = (error: string): BookingResult => ({ ok: false, error });

export async function createReservation(
  input: BookingInput
): Promise<BookingResult> {
  const { resourceId, date, start, end } = input;
  const purpose = input.purpose.trim();
  const bookedBy = input.bookedBy.trim();
  const notes = input.notes?.trim() || null;

  // 1. Basic input checks
  if (!resourceId) return fail("Please choose a resource.");
  if (!DATE_RE.test(date) || !TIME_RE.test(start) || !TIME_RE.test(end)) {
    return fail("Please enter a valid date and times.");
  }

  // 2. Time rules
  const s = toMinutes(start);
  const e = toMinutes(end);
  if (e <= s) return fail("End time must be after the start time.");
  if (s < OPEN_MIN || e > CLOSE_MIN) {
    return fail("Reservations are open between 08:00 and 18:00.");
  }
  const startTime = toDate(date, start);
  const endTime = toDate(date, end);
  if (Number.isNaN(startTime.getTime())) return fail("Please enter a valid date.");
  if (startTime < new Date()) return fail("You can't book a time in the past.");

  // 3. Who and why
  if (!purpose) return fail("Please enter a purpose.");
  if (!bookedBy) return fail("Please say who the booking is for.");

  // 4. Resource rules
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });
  if (!resource) return fail("This resource no longer exists.");
  if (!resource.isActive) return fail("This resource is not bookable.");

  const attendees = input.attendees ?? null;
  if (attendees !== null) {
    if (!Number.isInteger(attendees) || attendees < 1) {
      return fail("Attendees must be a whole number of at least 1.");
    }
    if (resource.capacity && attendees > resource.capacity) {
      return fail(`${resource.name} seats up to ${resource.capacity}.`);
    }
  }

  // 5. Clash check: friendly message first
  const findClash = () =>
    prisma.reservation.findFirst({
      where: {
        resourceId,
        status: "CONFIRMED",
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });

  const clashMessage = (c: NonNullable<Awaited<ReturnType<typeof findClash>>>) =>
    fail(
      `This time is already taken. It overlaps with "${c.purpose ?? "a reservation"}" (${formatTime(c.startTime)} – ${formatTime(c.endTime)}, ${c.bookedBy}).`
    );

  const clash = await findClash();
  if (clash) return clashMessage(clash);

  // 6. Save. The database constraint is the final judge.
  try {
    const created = await prisma.reservation.create({
      data: {
        resourceId,
        startTime,
        endTime,
        purpose,
        bookedBy,
        attendees,
        notes,
      },
    });
    return { ok: true, id: created.id };
  } catch (err) {
    // Someone booked the same slot a split second before us
    const raced = await findClash();
    if (raced) return clashMessage(raced);
    throw err;
  }
}