export default function Home() {
  return (
    <main className="mx-auto max-w-2xl p-8 space-y-6">
      <h1 className="text-3xl font-medium">Reservo</h1>

      <div className="rounded-xl bg-surface-container p-6 space-y-4">
        <p className="text-on-surface-variant">Material 3 theme test</p>
        <div className="flex gap-3">
          <button className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-on-primary hover:opacity-90">
            Filled button
          </button>
          <button className="rounded-full border border-outline px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/10">
            Outlined button
          </button>
        </div>
        <div className="rounded-lg bg-error-container p-3 text-sm text-on-error-container">
          Error message style
        </div>
      </div>
    </main>
  );
}