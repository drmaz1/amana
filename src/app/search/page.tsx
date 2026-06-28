import Link from "next/link";
import { SearchX, SlidersHorizontal } from "lucide-react";

import { searchTrips } from "@/lib/data";
import { governorateName } from "@/lib/governorates";
import { formatArabicDate } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { SearchFilters } from "@/components/search-filters";
import { SearchForm } from "@/components/search-form";
import { TripCard } from "@/components/trip-card";
import { RouteLine } from "@/components/route-line";
import { Button } from "@/components/ui/button";

export const metadata = { title: "البحث عن رحلة" };

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

export default async function SearchPage({
  searchParams,
}: {
  searchParams: {
    from?: string;
    to?: string;
    date?: string;
    sort?: string;
    seats?: string;
    parcels?: string;
  };
}) {
  const from = searchParams.from ?? "baghdad";
  const to = searchParams.to ?? "basra";
  const date = searchParams.date;

  let trips = await searchTrips({ from, to });

  // Filters + sort (preserved in the URL by <SearchFilters />).
  if (searchParams.seats === "1") {
    trips = trips.filter((t) => t.totalSeats - t.bookedSeats.length > 0);
  }
  if (searchParams.parcels === "1") {
    trips = trips.filter((t) => t.acceptsParcels);
  }
  const sort = searchParams.sort ?? "time";
  trips = [...trips].sort((a, b) =>
    sort === "price"
      ? a.pricePerSeat - b.pricePerSeat
      : sort === "price_desc"
        ? b.pricePerSeat - a.pricePerSeat
        : a.departureAt.localeCompare(b.departureAt),
  );

  return (
    <AppShell>
      {/* refine search — native collapsible, no JS needed */}
      <details className="group mb-5 rounded-xl border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
          <div className="min-w-0 flex-1">
            <RouteLine originId={from} destinationId={to} size="sm" />
            {date && (
              <div className="mt-1.5 text-center text-xs text-muted-foreground nums">
                {formatArabicDate(date)}
              </div>
            )}
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-secondary px-2.5 py-1.5 text-xs font-medium text-secondary-foreground">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            تعديل
          </span>
        </summary>
        <div className="border-t p-4">
          <SearchForm defaultFrom={from} defaultTo={to} />
        </div>
      </details>

      <div className="mb-3 flex items-baseline justify-between">
        <h1 className="font-display text-lg font-bold">
          {governorateName(from)} ← {governorateName(to)}
        </h1>
        <span className="text-sm text-muted-foreground nums">
          {arNum(trips.length)} رحلة
        </span>
      </div>

      <SearchFilters />

      {trips.length > 0 ? (
        <div className="grid gap-3">
          {trips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-card p-8 text-center">
          <SearchX className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <h2 className="mt-3 font-semibold">لا توجد رحلات على هذا الخط</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            جرّب تاريخاً آخر أو غيّر الوجهة. يمكنك أيضاً إرسال أمانة على هذا
            الخط.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href={`/parcels/new?from=${from}&to=${to}`}>
              أرسل أمانة بدلاً من ذلك
            </Link>
          </Button>
        </div>
      )}
    </AppShell>
  );
}
