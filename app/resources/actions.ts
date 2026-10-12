"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResourceType } from "@/generated/prisma/enums";

export async function createResource(
  _prevState: { error?: string },
  formData: FormData
) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const capacityRaw = String(formData.get("capacity") ?? "").trim();

  if (!name) return { error: "Name is required." };

  if (!Object.values(ResourceType).includes(type as ResourceType)) {
    return { error: "Please choose a valid type." };
  }

  let capacity: number | null = null;
  if (capacityRaw) {
    capacity = Number(capacityRaw);
    if (!Number.isInteger(capacity) || capacity < 1) {
      return { error: "Capacity must be a whole number of at least 1." };
    }
  }

  await prisma.resource.create({
    data: {
      name,
      type: type as ResourceType,
      location: location || null,
      capacity,
    },
  });

  revalidatePath("/resources");
  redirect("/resources");
}