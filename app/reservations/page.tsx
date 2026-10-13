import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { APP_TZ, formatTime } from "@/lib/time";

type Tab = "upcoming" | "past" | "cancelled";
type Status = "Confirmed" | "In progress" | "Completed" | "Cancelled";

const tabs: { key: Tab; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

const badgeStyle: Record<Status, string> = {
  Confirmed: "bg-blue-50 text-blue-700",
  "In progress": "bg-orange-50 text-orange-700",
  Completed: "bg-stone-100 text-stone-600",
  Cancelled: "bg-stone-100 text-stone-500",
};

const columns =
  "grid grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_110px_130px_110px_150px] items-center gap-4 px-4";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: APP_TZ,
  })
    .format(d)
    .replace(",", "");
}

function getStatus(
  r: { status: string; startTime: Date; endTime: Date },
  now: Date
): Status {
  if (r.status === "CANCELLED") return "Cancelled";
  if (r.endTime <= now) return "Completed";
  if (r.startTime <= now) return "In progress";
  return "Confirmed";
}

function getTab(status: Status): Tab {
  if (status === "Cancelled") return "cancelled";
  if (status === "Completed") return "past";
  return "upcoming";
}

async function ReservationTable({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const activeTab: Tab = tabs.some((t) => t.key === params.tab)
    ? (params.tab as Tab)
    : "upcoming";

  const now = new Date();
  const all = await prisma.reservation.findMany({
    include: { resource: { select: { name: true } } },
    orderBy: { startTime: "asc" },
  });

  const items = all.map((r) => {
    const status = getStatus(r, now);
    return { ...r, shownStatus: status, tab: getTab(status) };
  });

  const counts = {
    upcoming: items.filter((r) => r.tab === "upcoming").length,
    past: items.filter((r) => r.tab === "past").length,
    cancelled: items.filter((r) => r.tab === "cancelled").length,
  };

  const rows = items.filter((r) => r.tab === activeTab);
  if (activeTab !== "upcoming") rows.reverse(); // newest first

  return (
    <>
      <div
        role="tablist"
        aria-label="Reservation status"
        className="flex border-b border-stone-200"
      >
        {tabs.map((t) => {
          const on = t.key === activeTab;
          return (
            <Link
              key={t.key}
              href={`/reservations?tab=${t.key}`}
              role="tab"
              aria-selected={on}
              className={`-mb-px flex h-[42px] items-center border-b-2 px-3.5 font-medium ${
                on
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-stone-600 hover:text-zinc-900"
              }`}
            >
              {t.label}
              <span
                className={`ml-1 inline-flex h-5 items-center rounded-full px-[7px] text-xs ${
                  on ? "bg-zinc-900 text-white" : "bg-stone-100 text-stone-600"
                }`}
              >
                {counts[t.key]}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <div className="min-w-[900px]">
          <div
            className={`${columns} border-b border-stone-200 py-3 text-xs font-medium text-stone-500`}
          >
            <span>Reservation</span>
            <span>Resource</span>
            <span>Date</span>
            <span>Time</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {rows.length === 0 && (
            <div className="px-4 py-10 text-center text-stone-500">
              Nothing here yet.
            </div>
          )}

          {rows.map((r) => (
            <div
              key={r.id}
              className={`${columns} border-b border-stone-100 py-3.5 last:border-b-0`}
            >
              <div className="flex min-w-0 flex-col gap-0.5">
                <span className="truncate font-medium">
                  {r.purpose ?? "Reservation"}
                </span>
                <span className="truncate text-[13px] text-stone-500">
                  {r.bookedBy}
                </span>
              </div>
              <span className="truncate">{r.resource.name}</span>
              <span>{formatDate(r.startTime)}</span>
              <span className="font-mono text-[13px]">
                {formatTime(r.startTime)} – {formatTime(r.endTime)}
              </span>
              <span>
                <span
                  className={`inline-flex h-6 items-center whitespace-nowrap rounded-full px-2.5 text-xs font-medium ${badgeStyle[r.shownStatus]}`}
                >
                  {r.shownStatus}
                </span>
              </span>
              <span className="text-stone-400">—</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  return (
    <main className="flex flex-col gap-5 px-10 pb-12 pt-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="mb-1 text-[28px] font-semibold tracking-tight">
            Reservations
          </h1>
          <p className="text-stone-600">
            Every booking, with who made it and its status.
          </p>
        </div>
        <Link
          href="/reservations/new"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 font-medium text-white hover:bg-blue-800"
        >
          <Plus className="size-4" strokeWidth={2} />
          New reservation
        </Link>
      </header>

      <Suspense fallback={<p className="text-stone-500">Loading…</p>}>
        <ReservationTable searchParams={searchParams} />
      </Suspense>
    </main>
  );
}