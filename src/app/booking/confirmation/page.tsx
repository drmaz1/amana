import Link from "next/link";
import { PackageX, Search } from "lucide-react";

import { getTrip } from "@/lib/data";
import { AppShell } from "@/components/app-shell";
import { BookingConfirm } from "@/components/booking-confirm";
import { Button } from "@/components/ui/button";

/** Parse "1,2,4" into a sorted, de-duplicated list of valid seat numbers. */
function parseSeats(raw: string | undefined, totalSeats: number): number[] {
  if (!raw) return [];
  const set = new Set<number>();
  for (const part of raw.split(",")) {
    const n = Number(part.trim());
    if (Number.isInteger(n) && n >= 1 && n <= totalSeats) set.add(n);
  }
  return [...set].sort((a, b) => a - b);
}

export default async function BookingConfirmationPage({
  searchParams,
}: {
  searchParams: { trip?: string; seats?: string };
}) {
  const trip = searchParams.trip
    ? await getTrip(searchParams.trip)
    : undefined;
  const seats = trip ? parseSeats(searchParams.seats, trip.totalSeats) : [];

  if (!trip || seats.length === 0) {
    return (
      <AppShell>
        <div className="mx-auto max-w-md py-10 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <PackageX className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="font-display text-lg font-bold">
            تعذّر إتمام الحجز
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            لم نتمكّن من تحديد الرحلة أو المقاعد المختارة. ابدأ بحثاً جديداً
            واختر مقاعدك من جديد.
          </p>
          <Button asChild className="mt-5">
            <Link href="/search">
              <Search className="h-4 w-4" />
              ابحث عن رحلة
            </Link>
          </Button>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <BookingConfirm trip={trip} seats={seats} />
    </AppShell>
  );
}
