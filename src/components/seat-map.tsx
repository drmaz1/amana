"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Car, Check } from "lucide-react";

import type { Trip } from "@/types";
import { cn, formatIQD } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

function Seat({
  n,
  state,
  onToggle,
}: {
  n: number;
  state: "available" | "booked" | "selected";
  onToggle: (n: number) => void;
}) {
  const booked = state === "booked";
  const selected = state === "selected";
  return (
    <button
      type="button"
      disabled={booked}
      onClick={() => onToggle(n)}
      aria-pressed={selected}
      aria-label={`مقعد ${arNum(n)}${booked ? " محجوز" : ""}`}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-xl border-2 text-base font-bold transition-all nums",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        booked &&
          "cursor-not-allowed border-transparent bg-muted text-muted-foreground/50 line-through",
        !booked &&
          !selected &&
          "border-primary/30 bg-background text-foreground hover:border-primary hover:bg-primary/5",
        selected &&
          "scale-[1.03] border-primary bg-primary text-primary-foreground shadow-md",
      )}
    >
      {selected ? <Check className="h-5 w-5" /> : arNum(n)}
    </button>
  );
}

export function SeatMap({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<number>>(new Set());

  const booked = React.useMemo(
    () => new Set(trip.bookedSeats),
    [trip.bookedSeats],
  );

  function toggle(n: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  function stateOf(n: number): "available" | "booked" | "selected" {
    if (booked.has(n)) return "booked";
    if (selected.has(n)) return "selected";
    return "available";
  }

  // Seat 1 sits in the front next to the driver; the rest fill rows behind.
  const rearSeats = Array.from(
    { length: trip.totalSeats - 1 },
    (_, i) => i + 2,
  );

  const count = selected.size;
  const total = count * trip.pricePerSeat;

  function proceed() {
    const seats = [...selected].sort((a, b) => a - b).join(",");
    router.push(`/booking/confirmation?trip=${trip.id}&seats=${seats}`);
  }

  return (
    <div className="grid gap-5">
      {/* legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-4 rounded-md border-2 border-primary/30 bg-background" />
          متاح
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-4 rounded-md border-2 border-primary bg-primary" />
          مُختار
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-4 w-4 rounded-md bg-muted" />
          محجوز
        </span>
      </div>

      {/* vehicle body */}
      <div className="mx-auto w-full max-w-xs rounded-[1.75rem] border-2 border-border bg-secondary/40 p-4 pt-3">
        <div className="mb-3 flex items-center justify-center">
          <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-medium text-secondary-foreground">
            مقدمة المركبة
          </span>
        </div>

        {/* front row: driver + seat 1 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/40 text-muted-foreground">
            <Car className="h-6 w-6" />
          </div>
          <Seat n={1} state={stateOf(1)} onToggle={toggle} />
        </div>

        {/* aisle divider */}
        <div className="my-3 flex items-center gap-2 text-[10px] text-muted-foreground/60">
          <span className="h-px flex-1 bg-border" />
          الممر
          <span className="h-px flex-1 bg-border" />
        </div>

        {/* rear rows */}
        <div className="grid grid-cols-2 gap-3">
          {rearSeats.map((n) => (
            <Seat key={n} n={n} state={stateOf(n)} onToggle={toggle} />
          ))}
        </div>
      </div>

      {/* summary + CTA */}
      <div className="sticky bottom-20 z-10 rounded-xl border bg-card p-4 shadow-lg md:bottom-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="text-muted-foreground">
              {count > 0
                ? `${arNum(count)} مقعد مُختار`
                : "لم تختر أي مقعد بعد"}
            </div>
            <div className="font-display text-xl font-extrabold text-primary nums">
              {formatIQD(total)}
            </div>
          </div>
          <Button size="lg" disabled={count === 0} onClick={proceed}>
            متابعة الحجز
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
