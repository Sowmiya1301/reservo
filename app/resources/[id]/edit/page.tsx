import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { updateResource } from "../../actions";
import { ResourceForm } from "../../new/resource-form";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function EditLoader({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;

  if (!UUID_RE.test(id)) notFound();

  const resource = await prisma.resource.findUnique({ where: { id } });
  if (!resource) notFound();

  return (
    <ResourceForm
      action={updateResource.bind(null, resource.id)}
      initial={{
        name: resource.name,
        type: resource.type,
        location: resource.location,
        capacity: resource.capacity,
      }}
      submitLabel="Save changes"
    />
  );
}

export default function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-10 pb-12 pt-8">
      <div>
        <Link
          href="/resources"
          className="mb-3 inline-flex items-center gap-1 text-[13px] font-medium text-blue-700 hover:text-blue-900"
        >
          <ChevronLeft className="size-3.5" strokeWidth={2} />
          Back to resources
        </Link>
        <h1 className="text-[28px] font-semibold tracking-tight">
          Edit resource
        </h1>
      </div>

      <Suspense fallback={<p className="text-stone-500">Loading…</p>}>
        <EditLoader params={params} />
      </Suspense>
    </main>
  );
}