"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, LayoutGrid, List, Package } from "lucide-react";

const links = [
  { href: "/", label: "Overview", icon: LayoutGrid },
  { href: "/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/resources", label: "Resources", icon: Package },
  { href: "/reservations", label: "Reservations", icon: List },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className="flex w-56 shrink-0 flex-col gap-6 border-r border-stone-200 bg-white px-3 py-5"
    >
      <div className="flex items-center gap-2.5 px-2.5 py-1">
        <div className="flex size-7 items-center justify-center rounded-lg bg-zinc-900">
          <CalendarDays className="size-4 text-white" />
        </div>
        <span className="text-base font-semibold tracking-tight">Reservo</span>
      </div>

      <div className="flex flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium ${
                active
                  ? "bg-stone-100 text-zinc-900"
                  : "text-stone-600 hover:bg-stone-50"
              }`}
            >
              <Icon className="size-[18px]" strokeWidth={1.75} />
              {label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto flex items-center gap-2.5 border-t border-stone-200 px-2.5 pt-3.5">
        <div className="flex size-8 items-center justify-center rounded-full bg-stone-200 text-xs font-semibold text-stone-700">
          AD
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-medium">Admin</span>
          <span className="text-xs text-stone-500">Facilities team</span>
        </div>
      </div>
    </nav>
  );
}