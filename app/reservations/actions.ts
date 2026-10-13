"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createReservation } from "@/lib/reservation";

export type ReservationFormState = { error?: string };

export async function submitReservation(
  _prevState: ReservationFormState,
  formData: FormData
): Promise<ReservationFormState> {
  const attendeesRaw = String(formData.get("attendees") ?? "").trim();

  const result = await createReservation({
    resourceId: String(formData.get("resourceId") ?? ""),
    date: String(formData.get("date") ?? ""),
    start: String(formData.get("start") ?? ""),
    end: String(formData.get("end") ?? ""),
    purpose: String(formData.get("purpose") ?? ""),
    bookedBy: String(formData.get("bookedBy") ?? ""),
    attendees: attendeesRaw ? Number(attendeesRaw) : null,
    notes: String(formData.get("notes") ?? ""),
  });

  if (!result.ok) return { error: result.error };

  revalidatePath("/reservations");
  revalidatePath("/schedule");
  redirect("/reservations");
}

export async function cancelReservation(id: string) {
  await prisma.reservation.updateMany({
    where: { id, status: "CONFIRMED", endTime: { gt: new Date() } },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/reservations");
  revalidatePath("/schedule");
}