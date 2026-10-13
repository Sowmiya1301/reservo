"use client";
import Link from "next/link";
import { createResource } from "../actions";
import { useActionState } from "react";

const inputClass =
  "h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-zinc-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20";
const labelClass = "text-[13px] font-medium";

export function ResourceForm() {
  const [state, formAction, pending] = useActionState(createResource, {});

  return (
    <form
      action={formAction}
      className="space-y-5 rounded-xl border border-stone-200 bg-white p-6"
    >
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-[13px] text-red-800">
          {state.error}
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Name</span>
        <input name="name" className={inputClass} placeholder="Board Room A" />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Type</span>
        <select name="type" className={inputClass} defaultValue="ROOM">
          <option value="ROOM">Room</option>
          <option value="EQUIPMENT">Equipment</option>
          <option value="VEHICLE">Vehicle</option>
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Location</span>
          <input name="location" className={inputClass} placeholder="Floor 3" />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Capacity</span>
          <input
            name="capacity"
            type="number"
            min={1}
            className={inputClass}
            placeholder="12"
          />
        </label>
      </div>

      <div className="flex justify-end gap-2 pt-1">
        <Link
          href="/resources"
          className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 bg-white px-4 font-medium hover:bg-stone-50"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="min-h-10 rounded-lg bg-blue-700 px-4 font-medium text-white hover:bg-blue-800 disabled:bg-stone-200 disabled:text-stone-500"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}