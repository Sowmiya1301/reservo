import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Car, DoorClosed, Monitor, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";

const typeInfo = {
  ROOM: { label: "Room", icon: DoorClosed },
  EQUIPMENT: { label: "Equipment", icon: Monitor },
  VEHICLE: { label: "Vehicle", icon: Car },
} as const;

async function ResourceList() {
  await connection();

  const resources = await prisma.resource.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <section
      aria-label="Resource list"
      className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4"
    >
      {resources.map((r) => {
        const { label, icon: Icon } = typeInfo[r.type];
        return (
          <article
            key={r.id}
            className="flex flex-col gap-3.5 rounded-xl border border-stone-200 bg-white p-[18px]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-[10px] bg-stone-100 text-stone-700">
                  <Icon className="size-[18px]" strokeWidth={1.75} />
                </div>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <h2 className="text-[15px] font-semibold">{r.name}</h2>
                  <span className="text-[13px] text-stone-500">
                    {label}
                    {r.capacity ? ` · ${r.capacity} seats` : ""}
                  </span>
                </div>
              </div>
              <span
                className={`inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium ${
                  r.isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-stone-100 text-stone-500"
                }`}
              >
                {r.isActive ? "Available" : "Inactive"}
              </span>
            </div>

            <div className="rounded-lg bg-stone-50 px-3 py-2.5 text-[13px] text-stone-700">
              {r.location ?? "No location"}
            </div>

            <div className="flex gap-2">
              <Link
                href={`/schedule?resource=${r.id}`}
                className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg border border-stone-300 bg-white text-[13px] font-medium hover:bg-stone-50"
              >
                View schedule
              </Link>
              {r.isActive ? (
                <Link
                  href={`/reservations/new?resource=${r.id}`}
                  className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-blue-700 text-[13px] font-medium text-white hover:bg-blue-800"
                >
                  Book
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="inline-flex min-h-10 flex-1 items-center justify-center rounded-lg bg-stone-100 text-[13px] font-medium text-stone-500"
                >
                  Not bookable
                </span>
              )}
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default function ResourcesPage() {
  return (
    <main className="flex flex-col gap-5 px-10 pb-12 pt-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-[28px] font-semibold tracking-tight">
            Resources
          </h1>
          <p className="text-stone-600">
            Rooms, equipment and vehicles people can reserve.
          </p>
        </div>
        <Link
          href="/resources/new"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 font-medium text-white hover:bg-blue-800"
        >
          <Plus className="size-4" strokeWidth={2} />
          Add resource
        </Link>
      </header>

      <Suspense fallback={<p className="text-stone-500">Loading resources…</p>}>
        <ResourceList />
      </Suspense>
    </main>
  );
}