"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ResourceType } from "@/generated/prisma/enums";

type FormState = { error?: string };

function parseResource(formData: FormData):
  | { error: string }
  | {
      data: {
        name: string;
        type: ResourceType;
        location: string | null;
        capacity: number | null;
      };
    } {
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

  return {
    data: {
      name,
      type: type as ResourceType,
      location: location || null,
      capacity,
    },
  };
}

export async function createResource(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = parseResource(formData);
  if ("error" in parsed) return { error: parsed.error };

  await prisma.resource.create({ data: parsed.data });

  revalidatePath("/resources");
  redirect("/resources");
}

export async function updateResource(
  id: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const parsed = parseResource(formData);
  if ("error" in parsed) return { error: parsed.error };

  await prisma.resource.update({ where: { id }, data: parsed.data });

  revalidatePath("/resources");
  revalidatePath("/schedule");
  redirect("/resources");
}

export async function setResourceActive(
  id: string,
  active: boolean
): Promise<FormState> {
  if (!active) {
    const upcoming = await prisma.reservation.count({
      where: {
        resourceId: id,
        status: "CONFIRMED",
        endTime: { gt: new Date() },
      },
    });
    if (upcoming > 0) {
      return {
        error: `It has ${upcoming} upcoming booking${
          upcoming === 1 ? "" : "s"
        }. Cancel ${upcoming === 1 ? "it" : "them"} first.`,
      };
    }
  }

  await prisma.resource.update({ where: { id }, data: { isActive: active } });

  revalidatePath("/resources");
  revalidatePath("/schedule");
  return {};
}