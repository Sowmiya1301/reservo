import { Suspense } from "react";
import Link from "next/link";
import { connection } from "next/server";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { todayString } from "@/lib/time";
import { ReservationForm } from "./reservation-form";

async function FormLoader({
  searchParams,
}: {
  searchParams: Promise<{ resource?: string }>;
}) {
  await connection();
  const params = await searchParams;

  const resources = await prisma.resource.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, capacity: true, location: true },
  });

  if (resources.length === 0) {
    return (
      <p className="text-stone-600">
        There are no active resources to book yet.{" "}
        <Link href="/resources/new" className="text-blue-700 hover:text-blue-900">
          Add a resource
        </Link>
      </p>
    );
  }

  const defaultResourceId = resources.some((r) => r.id === params.resource)
    ? params.resource!
    : resources[0].id;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <ReservationForm
        resources={resources}
        defaultResourceId={defaultResourceId}
        today={todayString()}
      />
    </div>
  );
}

export default function NewReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ resource?: string }>;
}) {
  return (
    <main className="flex flex-col gap-5 px-10 pb-12 pt-8">
      <div>
        <Link
          href="/schedule"
          className="mb-3 inline-flex items-center gap-1 text-[13px] font-medium text-blue-700 hover:text-blue-900"
        >
          <ChevronLeft className="size-3.5" strokeWidth={2} />
          Back to schedule
        </Link>
        <h1 className="mb-1 text-[28px] font-semibold tracking-tight">
          New reservation
        </h1>
        <p className="text-stone-600">
          Pick a resource and a time. We check for clashes as you type.
        </p>
      </div>

      <Suspense fallback={<p className="text-stone-500">Loading…</p>}>
        <FormLoader searchParams={searchParams} />
      </Suspense>
    </main>
  );
}