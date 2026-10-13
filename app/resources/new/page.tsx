import { createResource } from "../actions";
import { ResourceForm } from "./resource-form";

export default function NewResourcePage() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-5 px-10 pb-12 pt-8">
      <h1 className="text-[28px] font-semibold tracking-tight">Add resource</h1>
      <ResourceForm action={createResource} submitLabel="Save" />
    </main>
  );
}