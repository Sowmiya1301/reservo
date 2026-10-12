"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createResource } from "../actions";

const inputClass =
  "w-full rounded-lg border border-outline bg-surface px-4 py-3 text-on-surface outline-none focus:border-2 focus:border-primary";

export function ResourceForm() {
  const [state, formAction, pending] = useActionState(createResource, {});

  return (
    <form action={formAction} className="space-y-5">
      {state.error && (
        <div className="rounded-lg bg-error-container p-3 text-sm text-on-error-container">
          {state.error}
        </div>
      )}

      <label className="block space-y-1">
        <span className="text-sm text-on-surface-variant">Name *</span>
        <input name="name" className={inputClass} placeholder="Board Room A" />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-on-surface-variant">Type *</span>
        <select name="type" className={inputClass} defaultValue="ROOM">
          <option value="ROOM">Room</option>
          <option value="EQUIPMENT">Equipment</option>
          <option value="VEHICLE">Vehicle</option>
        </select>
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-on-surface-variant">Location</span>
        <input name="location" className={inputClass} placeholder="Floor 3" />
      </label>

      <label className="block space-y-1">
        <span className="text-sm text-on-surface-variant">Capacity</span>
        <input
          name="capacity"
          type="number"
          min={1}
          className={inputClass}
          placeholder="12"
        />
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Link
          href="/resources"
          className="rounded-full px-6 py-2.5 text-sm font-medium text-primary hover:bg-primary/10"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-on-primary hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}