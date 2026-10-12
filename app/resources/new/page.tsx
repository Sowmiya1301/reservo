import { ResourceForm } from "./resource-form";

export default function NewResourcePage() {
  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-3xl font-medium mb-6">Add resource</h1>
      <ResourceForm />
    </main>
  );
}