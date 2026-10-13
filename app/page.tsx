import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import {
  CLOSE_MIN,
  OPEN_MIN,
  formatTime,
  labelDate,
  shiftDate,
  toDate,
  toMinutes,
  todayString,
  weekStart,
} from "@/lib/time";

const typeLabel = { ROOM: "Room", EQUIPMENT: "Equipment", VEHICLE: "Vehicle" } as const;

const badgeStyle = {
  Confirmed: "bg-blue-50 text-blue-700",
  "In progress": "bg-orange-50 text-orange-700",
  Completed: "bg-stone-100 text-stone-600",
} as const;

async function Dashboard() {
  await connection();

  const now = new Date();
  const today = todayString();
  const nowMin = toMinutes(formatTime(now));

  const dayStart = toDate(today, "00:00");
  const dayEnd = toDate(shiftDate(today, 1), "00:00");
  const monday = weekStart(today);
  const weekFrom = toDate(monday, "00:00");
  const weekTo = toDate(shiftDate(monday, 5), "00:00"); // Mon to Fri

  const [resources, todays, week] = await Promise.all([
    prisma.resource.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.reservation.findMany({
      where: { status: "CONFIRMED", startTime: { gte: dayStart, lt: dayEnd } },
      include: { resource: { select: { name: true } } },
      orderBy: { startTime: "asc" },
    }),
    prisma.reservation.findMany({
      where: {
        status: "CONFIRMED",
        resource: { isActive: true },
        startTime: { gte: weekFrom, lt: weekTo },
      },
      select: { startTime: true, endTime: true },
    }),
  ]);

  // Stats
  const count = (t: keyof typeof typeLabel) =>
    resources.filter((r) => r.type === t).length;
  const inUse = new Set(
    todays.filter((r) => r.startTime <= now && r.endTime > now).map((r) => r.resourceId)
  );
  const stillToCome = todays.filter((r) => r.startTime > now).length;
  const bookedMin = week.reduce(
    (sum, r) => sum + (r.endTime.getTime() - r.startTime.getTime()) / 60000,
    0
  );
  const capacityMin = resources.length * 5 * (CLOSE_MIN - OPEN_MIN);
  const utilisation = capacityMin ? Math.round((bookedMin / capacityMin) * 100) : 0;

  const stats = [
    {
      label: "Active resources",
      value: resources.length,
      hint: `${count("ROOM")} rooms · ${count("EQUIPMENT")} equipment · ${count("VEHICLE")} vehicles`,
    },
    {
      label: "In use right now",
      value: inUse.size,
      hint: `of ${resources.length} bookable resources`,
    },
    {
      label: "Reservations today",
      value: todays.length,
      hint: `${stillToCome} still to come`,
    },
    {
      label: "Utilisation this week",
      value: `${utilisation}%`,
      hint: "Mon – Fri, 08:00 – 18:00",
    },
  ];

  // Available now
  const isOpen = nowMin >= OPEN_MIN && nowMin < CLOSE_MIN;
  const available = isOpen
    ? resources
        .filter((r) => !inUse.has(r.id))
        .map((r) => {
          const next = todays.find((t) => t.resourceId === r.id && t.startTime > now);
          const hasAny = todays.some((t) => t.resourceId === r.id);
          const until = next
            ? `Free until ${formatTime(next.startTime)}`
            : hasAny
              ? "Free for the rest of today"
              : "Free all day";
          return { ...r, until };
        })
    : [];

  const hour = Math.floor(nowMin / 60);
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const statusOf = (r: { startTime: Date; endTime: Date }) =>
    r.endTime <= now ? "Completed" : r.startTime <= now ? "In progress" : "Confirmed";

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-stone-600">{labelDate(today)}</p>
          <h1 className="text-[28px] font-semibold tracking-tight">{greeting}</h1>
        </div>
        <Link
          href="/reservations/new"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 font-medium text-white hover:bg-blue-800"
        >
          <Plus className="size-4" strokeWidth={2} />
          New reservation
        </Link>
      </header>

      <section
        aria-label="Summary"
        className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4"
      >
        {stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-1 rounded-xl border border-stone-200 bg-white p-[18px]"
          >
            <span className="text-[13px] text-stone-600">{s.label}</span>
            <span className="text-[28px] font-semibold tracking-tight">{s.value}</span>
            <span className="text-xs text-stone-500">{s.hint}</span>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
        <section className="rounded-xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="text-base font-semibold">Today&apos;s reservations</h2>
            <Link href="/schedule" className="text-[13px] font-medium text-blue-700 hover:text-blue-900">
              Open schedule
            </Link>
          </div>
          <ul className="divide-y divide-stone-100">
            {todays.length === 0 && (
              <li className="px-5 py-8 text-center text-stone-500">
                No reservations today.
              </li>
            )}
            {todays.map((r) => {
              const status = statusOf(r);
              return (
                <li key={r.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-[110px] shrink-0 font-mono text-[13px] text-stone-600">
                    {formatTime(r.startTime)} – {formatTime(r.endTime)}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">{r.purpose ?? "Reservation"}</span>
                    <span className="truncate text-[13px] text-stone-500">
                      {r.resource.name} · {r.bookedBy}
                    </span>
                  </div>
                  <span
                    className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-medium ${badgeStyle[status]}`}
                  >
                    {status}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-xl border border-stone-200 bg-white">
          <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
            <h2 className="text-base font-semibold">Available now</h2>
            <Link href="/resources" className="text-[13px] font-medium text-blue-700 hover:text-blue-900">
              All resources
            </Link>
          </div>
          <ul className="divide-y divide-stone-100">
            {!isOpen && (
              <li className="px-5 py-8 text-center text-stone-500">
                Outside booking hours (08:00 – 18:00).
              </li>
            )}
            {isOpen && available.length === 0 && (
              <li className="px-5 py-8 text-center text-stone-500">
                Everything is in use right now.
              </li>
            )}
            {available.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">{r.name}</span>
                  <span className="truncate text-[13px] text-stone-500">
                    {typeLabel[r.type]}
                    {r.capacity ? ` · ${r.capacity} seats` : ""}
                    {r.location ? ` · ${r.location}` : ""}
                  </span>
                  <span className="text-xs text-emerald-700">{r.until}</span>
                </div>
                <Link
                  href={`/reservations/new?resource=${r.id}`}
                  className="inline-flex h-8 shrink-0 items-center rounded-lg border border-stone-300 px-3 text-[13px] font-medium hover:bg-stone-50"
                >
                  Book
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}

export default function OverviewPage() {
  return (
    <main className="flex flex-col gap-5 px-10 pb-12 pt-8">
      <Suspense fallback={<p className="text-stone-500">Loading overview…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}