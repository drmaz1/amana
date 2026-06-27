"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, CalendarDays, Search } from "lucide-react";

import { GOVERNORATES } from "@/lib/governorates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function todayStr() {
  const d = new Date();
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 10);
}

export function SearchForm({
  defaultFrom = "baghdad",
  defaultTo = "basra",
}: {
  defaultFrom?: string;
  defaultTo?: string;
}) {
  const router = useRouter();
  const [from, setFrom] = React.useState(defaultFrom);
  const [to, setTo] = React.useState(defaultTo);
  const [date, setDate] = React.useState("");

  // Set default date on the client to avoid hydration mismatch.
  React.useEffect(() => setDate(todayStr()), []);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  function submit() {
    const params = new URLSearchParams({ from, to });
    if (date) params.set("date", date);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <div className="grid gap-1.5">
          <Label htmlFor="from">من</Label>
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger id="from" aria-label="محافظة الانطلاق">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOVERNORATES.map((g) => (
                <SelectItem key={g.id} value={g.id} disabled={g.id === to}>
                  {g.ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={swap}
          aria-label="تبديل الوجهتين"
          className="mb-0.5 shrink-0"
        >
          <ArrowLeftRight className="h-4 w-4" />
        </Button>

        <div className="grid gap-1.5">
          <Label htmlFor="to">إلى</Label>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger id="to" aria-label="محافظة الوصول">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {GOVERNORATES.map((g) => (
                <SelectItem key={g.id} value={g.id} disabled={g.id === from}>
                  {g.ar}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="date">تاريخ السفر</Label>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="date"
            type="date"
            value={date}
            min={todayStr()}
            onChange={(e) => setDate(e.target.value)}
            className="ps-3 pe-10 nums"
          />
        </div>
      </div>

      <Button size="lg" onClick={submit} className="mt-1 w-full text-base">
        <Search className="h-5 w-5" />
        ابحث عن رحلة
      </Button>
    </div>
  );
}
