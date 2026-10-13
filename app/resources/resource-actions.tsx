"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { setResourceActive } from "./actions";

export function ResourceActions({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-2 border-t border-stone-100 pt-3">
      <div className="flex items-center justify-between">
        <Link
          href={`/resources/${id}/edit`}
          className="text-[13px] font-medium text-blue-700 hover:text-blue-900"
        >
          Edit
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await setResourceActive(id, !active);
              setError(result.error ?? "");
            })
          }
          className={`text-[13px] font-medium disabled:opacity-60 ${
            active
              ? "text-stone-600 hover:text-red-700"
              : "text-blue-700 hover:text-blue-900"
          }`}
        >
          {pending ? "Please wait…" : active ? "Deactivate" : "Activate"}
        </button>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}