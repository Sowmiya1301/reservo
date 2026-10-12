import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import Link from "next/link";

async function ResourceList() {
      await connection();

  const resources = await prisma.resource.findMany({
    orderBy: { name: "asc" },
  });
 

  return (
    <div className="grid gap-4 sm:grid-cols-2">
        
      {resources.map((r) => (
        <div
          key={r.id}
          className="rounded-xl bg-surface-container p-5 space-y-3"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-lg font-medium">{r.name}</h2>
            <span
              className={`rounded-lg px-3 py-1 text-xs font-medium ${
                r.isActive
                  ? "bg-primary-container text-on-primary-container"
                  : "bg-surface-container-high text-on-surface-variant"
              }`}
            >
              {r.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-lg bg-secondary-container px-3 py-1 text-on-secondary-container">
              {r.type.charAt(0) + r.type.slice(1).toLowerCase()}
            </span>
          </div>

          <p className="text-sm text-on-surface-variant">
            {r.location ?? "No location"}
            {r.capacity ? ` · ${r.capacity} seats` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ResourcesPage() {
  return (
    <main className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-center justify-between">
  <h1 className="text-3xl font-medium">Resources</h1>
  <Link
    href="/resources/new"
    className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-on-primary hover:opacity-90"
  >
    + Add resource
  </Link>
</div>

      <Suspense
        fallback={<p className="text-on-surface-variant">Loading resources…</p>}
      >
        
        <ResourceList />
      </Suspense>
    </main>
  );
}