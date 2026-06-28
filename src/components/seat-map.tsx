"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Armchair } from "lucide-react";

import type { Trip } from "@/types";
import {
  categoryLabel,
  getSeatLayout,
  vehicleLabel,
  type SeatCategory,
} from "@/lib/seats";
import { cn, formatIQD } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

type SeatState = "available" | "booked" | "selected";

function Seat({
  n,
  price,
  category,
  state,
  onToggle,
}: {
  n: number;
  price: number;
  category: SeatCategory;
  state: SeatState;
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
      aria-label={`مقعد ${arNum(n)} ${categoryLabel(category)}${
        booked ? " محجوز" : ` بسعر ${formatIQD(price)}`
      }`}
      className={cn(
        "relative flex h-[4.75rem] w-full flex-col items-center justify-center gap-0.5 rounded-xl border-2 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        booked &&
          "cursor-not-allowed border-transparent bg-muted text-muted-foreground/50",
        !booked &&
          !selected &&
          "border-primary/25 bg-background text-foreground hover:border-primary hover:bg-primary/5",
        selected &&
          "border-primary bg-primary text-primary-foreground shadow-md",
      )}
    >
      {/* seat back notch */}
      <span
        className={cn(
          "absolute inset-x-3 top-1 h-1 rounded-full",
          booked
            ? "bg-muted-foreground/20"
            : selected
              ? "bg-primary-foreground/40"
              : "bg-primary/20",
        )}
      />
      {booked ? (
        <span className="text-xs font-medium">محجوز</span>
      ) : (
        <>
          <span className="inline-flex items-center gap-1 text-sm font-bold nums">
            {selected ? <Check className="h-3.5 w-3.5" /> : <Armchair className="h-3.5 w-3.5 opacity-70" />}
            {arNum(n)}
          </span>
          <span
            className={cn(
              "text-[11px] font-semibold nums",
              selected ? "text-primary-foreground" : "text-primary",
            )}
          >
            {arNum(price)}
          </span>
          <span
            className={cn(
              "text-[9px]",
              selected ? "text-primary-foreground/75" : "text-muted-foreground",
            )}
          >
            {categoryLabel(category)}
          </span>
        </>
      )}
    </button>
  );
}

function DriverCell() {
  return (
    <div className="flex h-[4.75rem] w-full flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-muted/40 text-muted-foreground">
      {/* steering wheel */}
      <span className="relative flex h-7 w-7 items-center justify-center rounded-full border-[3px] border-current">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 bg-current" />
        <span className="absolute bottom-0 left-1/2 h-1/2 w-[2px] -translate-x-1/2 bg-current" />
      </span>
      <span className="text-[10px] font-medium">السائق</span>
    </div>
  );
}

export function SeatMap({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<number>>(new Set());

  const booked = React.useMemo(() => new Set(trip.bookedSeats), [trip.bookedSeats]);
  const layout = React.useMemo(
    () => getSeatLayout(trip.vehicleType, trip.totalSeats),
    [trip.vehicleType, trip.totalSeats],
  );

  function toggle(n: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  }

  function stateOf(n: number): SeatState {
    if (booked.has(n)) return "booked";
    if (selected.has(n)) return "selected";
    return "available";
  }

  const priceOf = (n: number) => trip.seatPrices[n - 1] ?? trip.pricePerSeat;
  const count = selected.size;
  const total = [...selected].reduce((s, n) => s + priceOf(n), 0);

  function proceed() {
    const seats = [...selected].sort((a, b) => a - b).join(",");
    router.push(`/booking/confirmation?trip=${trip.id}&seats=${seats}`);
  }

  return (
    <div className="grid gap-5">
      {/* legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
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

      {/* car body — fixed LTR so the driver sits physically front-left */}
      <div
        dir="ltr"
        className="mx-auto w-full max-w-[20rem] rounded-[2rem] border-2 border-border bg-secondary/40 p-3"
      >
        {/* windshield / front */}
        <div className="mx-3 mb-3 h-2 rounded-b-[1.5rem] rounded-t-md bg-gradient-to-b from-primary/15 to-transparent" />
        <div className="mb-2 text-center text-[11px] font-medium text-muted-foreground">
          مقدمة {vehicleLabel(trip.vehicleType)}
        </div>

        {layout.map((row, ri) => {
          const cols = row.length;
          return (
            <React.Fragment key={ri}>
              {ri === 1 && (
                <div className="my-2 flex items-center gap-2 text-[10px] text-muted-foreground/60">
                  <span className="h-px flex-1 bg-border" />
                  الممر
                  <span className="h-px flex-1 bg-border" />
                </div>
              )}
              {ri > 1 && <div className="h-3" />}
              <div
                className="grid gap-2.5"
                style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
              >
                {row.map((cell, ci) =>
                  cell.kind === "driver" ? (
                    <DriverCell key={`d${ci}`} />
                  ) : (
                    <Seat
                      key={cell.n}
                      n={cell.n}
                      price={priceOf(cell.n)}
                      category={cell.category}
                      state={stateOf(cell.n)}
                      onToggle={toggle}
                    />
                  ),
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* selected summary */}
      {count > 0 && (
        <div className="mx-auto w-full max-w-[20rem] rounded-xl border bg-card p-3 text-sm">
          <div className="grid gap-1.5">
            {[...selected]
              .sort((a, b) => a - b)
              .map((n) => (
                <div key={n} className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    مقعد <span className="nums">{arNum(n)}</span>
                  </span>
                  <span className="font-medium text-primary nums">
                    {formatIQD(priceOf(n))}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* summary + CTA */}
      <div className="sticky bottom-20 z-10 rounded-xl border bg-card p-4 shadow-lg md:bottom-4">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <div className="text-muted-foreground">
              {count > 0 ? `${arNum(count)} مقعد مُختار` : "لم تختر أي مقعد بعد"}
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
