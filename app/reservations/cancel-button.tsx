"use client";

import { useState, useTransition } from "react";
import { cancelReservation } from "./actions";

export function CancelButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="h-8 rounded-lg border border-red-200 bg-white px-3 text-[13px] font-medium text-red-700 hover:bg-red-50"
      >
        Cancel
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px]">
      <span className="text-stone-600">Cancel this booking?</span>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={pending}
        className="h-8 rounded-lg border border-stone-300 bg-white px-3 font-medium hover:bg-stone-50"
      >
        Keep
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await cancelReservation(id);
          })
        }
        className="h-8 rounded-lg bg-red-700 px-3 font-medium text-white hover:bg-red-800 disabled:opacity-60"
      >
        {pending ? "Cancelling…" : "Yes, cancel"}
      </button>
    </div>
  );
}