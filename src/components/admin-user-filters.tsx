"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_OPTIONS = [
  { value: "all", label: "كل الأدوار" },
  { value: "PASSENGER", label: "ركّاب" },
  { value: "DRIVER", label: "سائقون" },
  { value: "ADMIN", label: "مدراء" },
];

export function AdminUserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const [q, setQ] = React.useState(params.get("q") ?? "");
  const role = params.get("role") ?? "all";

  function update(next: Record<string, string | null>) {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null || v === "" || v === "all") sp.delete(k);
      else sp.set(k, v);
    }
    sp.delete("page"); // any filter change returns to the first page
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative min-w-[12rem] flex-1">
        <Search className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="ابحث بالاسم أو رقم الهاتف"
          className="ps-3 pe-10"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && update({ q })}
        />
        {q && (
          <button
            type="button"
            aria-label="مسح البحث"
            onClick={() => {
              setQ("");
              update({ q: null });
            }}
            className="absolute start-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-secondary"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <Select value={role} onValueChange={(v) => update({ role: v })}>
        <SelectTrigger className="h-10 w-[8.5rem]" aria-label="تصفية حسب الدور">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
