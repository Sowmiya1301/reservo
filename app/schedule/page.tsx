import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatTime, toDate, toMinutes, todayString } from "@/lib/time";

const OPEN = 8 * 60;
const SPAN = 10 * 60; // 08:00 to 18:00
const pct = (min: number) => ((min - OPEN) / SPAN) * 100;
const hours = Array.from({ length: 10 }, (_, i) => `${String(8 + i).padStart(2, "0")}:00`);

const filters = [
  { key: "all", label: "All" },
  { key: "room", label: "Rooms" },
  { key: "equipment", label: "Equipment" },
  { key: "vehicle", label: "Vehicles" },
];

const typeMap = {
  room: "ROOM",
  equipment: "EQUIPMENT",
  vehicle: "VEHICLE",
} as const;

const typeLabel = { ROOM: "Room", EQUIPMENT: "Equipment", VEHICLE: "Vehicle" } as const;

function shiftDate(date: string, days: number) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function labelDate(date: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function href(date: string, type: string) {
  const p = new URLSearchParams();
  p.set("date", date);
  if (type !== "all") p.set("type", type);
  return `/schedule?${p.toString()}`;
}

function blockLook(start: Date, end: Date, now: Date) {
  if (end <= now)
    return {
      box: "bg-stone-100 border-stone-200",
      title: "text-stone-600",
      time: "text-stone-500",
    };
  if (start <= now)
    return {
      box: "bg-blue-700 border-blue-700",
      title: "text-white",
      time: "text-blue-100",
    };
  return {
    box: "bg-blue-50 border-blue-200",
    title: "text-blue-900",
    time: "text-blue-700",
  };
}

async function ScheduleGrid({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; type?: string }>;
}) {
  await connection();
  const params = await searchParams;

  const today = todayString();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? "") ? params.date! : today;
  const type = filters.some((f) => f.key === params.type) ? params.type! : "all";

  const resources = await prisma.resource.findMany({
    where: {
      isActive: true,
      ...(type !== "all" ? { type: typeMap[type as keyof typeof typeMap] } : {}),
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  const reservations = await prisma.reservation.findMany({
    where: {
      status: "CONFIRMED",
      resourceId: { in: resources.map((r) => r.id) },
      startTime: {
        gte: toDate(date, "00:00"),
        lt: toDate(shiftDate(date, 1), "00:00"),
      },
    },
    orderBy: { startTime: "asc" },
  });

  const now = new Date();
  const nowMin = toMinutes(formatTime(now));
  const showNow = date === today && nowMin >= OPEN && nowMin <= OPEN + SPAN;

  const navButton =
    "inline-flex size-9 items-center justify-center rounded-lg border border-stone-300 bg-white hover:bg-stone-50";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href={href(shiftDate(date, -1), type)} aria-label="Previous day" className={navButton}>
            <ChevronLeft className="size-4" strokeWidth={2} />
          </Link>
          <Link
            href={href(today, type)}
            className="inline-flex h-9 items-center rounded-lg border border-stone-300 bg-white px-3.5 font-medium hover:bg-stone-50"
          >
            Today
          </Link>
          <Link href={href(shiftDate(date, 1), type)} aria-label="Next day" className={navButton}>
            <ChevronRight className="size-4" strokeWidth={2} />
          </Link>
          <span className="ml-2 font-medium">{labelDate(date)}</span>
        </div>

        <div role="group" aria-label="Filter by type" className="flex gap-1 rounded-[10px] bg-stone-100 p-1">
          {filters.map((f) => (
            <Link
              key={f.key}
              href={href(date, f.key)}
              aria-pressed={f.key === type}
              className={`inline-flex h-8 items-center rounded-[7px] px-3 text-[13px] font-medium ${
                f.key === type
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-stone-600 hover:text-zinc-900"
              }`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <div className="relative min-w-[900px]">
          {showNow && (
            <div className="pointer-events-none absolute inset-y-0 left-[220px] right-0 z-10">
              <div
                className="absolute inset-y-0 w-0.5 bg-red-500"
                style={{ left: `${pct(nowMin)}%` }}
              />
            </div>
          )}

          <div className="grid grid-cols-[220px_1fr] border-b border-stone-200 text-xs font-medium text-stone-500">
            <div className="px-4 py-3">Resource</div>
            <div className="grid grid-cols-10">
              {hours.map((h) => (
                <div key={h} className="border-l border-stone-100 py-3 pl-2 font-mono">
                  {h}
                </div>
              ))}
            </div>
          </div>

          {resources.length === 0 && (
            <div className="px-4 py-10 text-center text-stone-500">
              No resources to show.
            </div>
          )}

          {resources.map((r) => {
            const blocks = reservations.filter((b) => b.resourceId === r.id);
            return (
              <div
                key={r.id}
                className="grid grid-cols-[220px_1fr] border-b border-stone-100 last:border-b-0"
              >
                <div className="flex items-center justify-between gap-2 px-4 py-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-[13px] font-semibold">{r.name}</span>
                    <span className="text-xs text-stone-500">
                      {typeLabel[r.type]}
                      {r.capacity ? ` · ${r.capacity} seats` : ""}
                    </span>
                  </div>
                  <Link
                    href={`/reservations/new?resource=${r.id}`}
                    aria-label={`Book ${r.name}`}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-stone-300 text-stone-600 hover:bg-stone-50"
                  >
                    <Plus className="size-3.5" strokeWidth={2} />
                  </Link>
                </div>

                <div className="relative h-16 bg-[linear-gradient(to_right,#f5f5f4_1px,transparent_1px)] bg-[length:10%_100%]">
                  {blocks.map((b) => {
                    const s = toMinutes(formatTime(b.startTime));
                    const e = toMinutes(formatTime(b.endTime));
                    const look = blockLook(b.startTime, b.endTime, now);
                    return (
                      <div
                        key={b.id}
                        title={`${b.purpose ?? "Reservation"} · ${b.bookedBy}`}
                        className={`absolute bottom-2 top-2 flex flex-col gap-0.5 overflow-hidden rounded-lg border px-2.5 py-1.5 ${look.box}`}
                        style={{
                          left: `calc(${pct(s)}% + 2px)`,
                          width: `calc(${pct(e) - pct(s)}% - 4px)`,
                        }}
                      >
                        <span className={`truncate text-xs font-semibold ${look.title}`}>
                          {b.purpose ?? "Reservation"}
                        </span>
                        <span className={`truncate font-mono text-[11px] ${look.time}`}>
                          {formatTime(b.startTime)} – {formatTime(b.endTime)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-5 text-[13px] text-stone-600">
        <span className="flex items-center gap-2">
          <span className="size-3 rounded bg-blue-700" /> In progress
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded border border-blue-200 bg-blue-50" /> Booked
        </span>
        <span className="flex items-center gap-2">
          <span className="size-3 rounded border border-stone-200 bg-stone-100" /> Finished
        </span>
        {showNow && (
          <span className="flex items-center gap-2">
            <span className="h-3 w-0.5 bg-red-500" /> Now · {formatTime(now)}
          </span>
        )}
      </div>
    </>
  );
}

export default function SchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; type?: string }>;
}) {
  return (
    <main className="flex flex-col gap-5 px-10 pb-12 pt-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-[28px] font-semibold tracking-tight">Schedule</h1>
          <p className="text-stone-600">Every resource for one day. Gaps are free time.</p>
        </div>
        <Link
          href="/reservations/new"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 font-medium text-white hover:bg-blue-800"
        >
          <Plus className="size-4" strokeWidth={2} />
          New reservation
        </Link>
      </header>

      <Suspense fallback={<p className="text-stone-500">Loading schedule…</p>}>
        <ScheduleGrid searchParams={searchParams} />
      </Suspense>
    </main>
  );
}