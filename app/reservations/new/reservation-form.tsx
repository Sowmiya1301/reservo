"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { submitReservation, type ReservationFormState } from "../actions";

type ResourceOption = {
  id: string;
  name: string;
  capacity: number | null;
  location: string | null;
};

const inputClass =
  "h-[42px] w-full rounded-lg border border-stone-300 bg-white px-3 text-zinc-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20";
const timeClass = `${inputClass} font-mono`;
const labelClass = "text-[13px] font-medium";

export function ReservationForm({
  resources,
  defaultResourceId,
  today,
}: {
  resources: ResourceOption[];
  defaultResourceId: string;
  today: string;
}) {
  const [state, formAction, pending] = useActionState<
    ReservationFormState,
    FormData
  >(submitReservation, {});

  const [v, setV] = useState({
    resourceId: defaultResourceId,
    date: today,
    start: "10:00",
    end: "11:30",
    purpose: "",
    attendees: "",
    bookedBy: "",
    notes: "",
  });

  const set =
    (key: keyof typeof v) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) =>
      setV((prev) => ({ ...prev, [key]: e.target.value }));

  const optionText = (r: ResourceOption) => {
    const details = [r.capacity ? `${r.capacity} seats` : null, r.location]
      .filter(Boolean)
      .join(", ");
    return details ? `${r.name} — ${details}` : r.name;
  };

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 rounded-xl border border-stone-200 bg-white p-6"
    >
      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Resource</span>
        <select
          name="resourceId"
          value={v.resourceId}
          onChange={set("resourceId")}
          className={inputClass}
        >
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {optionText(r)}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Date</span>
          <input
            name="date"
            type="date"
            min={today}
            value={v.date}
            onChange={set("date")}
            className={timeClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Start</span>
          <input
            name="start"
            type="time"
            step={900}
            value={v.start}
            onChange={set("start")}
            className={timeClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>End</span>
          <input
            name="end"
            type="time"
            step={900}
            value={v.end}
            onChange={set("end")}
            className={timeClass}
          />
        </label>
      </div>

      {state.error && (
        <div
          role="alert"
          className="flex gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 text-[13px] text-amber-900"
        >
          <TriangleAlert className="mt-px size-4 shrink-0" strokeWidth={2} />
          <span>{state.error}</span>
        </div>
      )}

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>Purpose</span>
        <input
          name="purpose"
          value={v.purpose}
          onChange={set("purpose")}
          placeholder="e.g. Sprint review"
          className={inputClass}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Attendees</span>
          <input
            name="attendees"
            type="number"
            min={1}
            value={v.attendees}
            onChange={set("attendees")}
            placeholder="8"
            className={inputClass}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className={labelClass}>Booked for</span>
          <input
            name="bookedBy"
            value={v.bookedBy}
            onChange={set("bookedBy")}
            placeholder="Team or person"
            className={inputClass}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className={labelClass}>
          Notes <span className="font-normal text-stone-500">(optional)</span>
        </span>
        <textarea
          name="notes"
          rows={3}
          value={v.notes}
          onChange={set("notes")}
          placeholder="Anything the facilities team should prepare"
          className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-zinc-900 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-700/20"
        />
      </label>

      <div className="flex gap-2 pt-1">
  <Link
    href="/reservations"
    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-[13px] font-medium hover:bg-stone-50"
  >
    Cancel
  </Link>

  <button
    type="submit"
    disabled={pending}
    className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-blue-700 px-4 text-[13px] font-medium text-white hover:bg-blue-800 disabled:bg-stone-200 disabled:text-stone-500"
  >
    {pending ? "Saving…" : "Confirm reservation"}
  </button>
</div>
    </form>
  );
}