import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Clock } from "lucide-react";

import { getTrip } from "@/lib/data";
import { formatArabicDate, formatDuration, formatTime } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { RouteLine } from "@/components/route-line";
import { SeatMap } from "@/components/seat-map";
import { Card, CardContent } from "@/components/ui/card";

export default async function SeatSelectionPage({
  params,
}: {
  params: { id: string };
}) {
  const trip = await getTrip(params.id);
  if (!trip) notFound();

  return (
    <AppShell>
      {/* breadcrumb back to trip */}
      <Link
        href={`/trips/${trip.id}`}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronRight className="h-4 w-4" />
        رجوع إلى تفاصيل الرحلة
      </Link>

      <h1 className="mb-1 font-display text-xl font-bold">اختر مقعدك</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        اضغط على المقاعد المتاحة لاختيارها، ثم تابع الحجز.
      </p>

      {/* trip summary */}
      <Card className="mb-5">
        <CardContent className="p-4">
          <RouteLine
            originId={trip.originId}
            destinationId={trip.destinationId}
            size="sm"
            middle={
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(trip.durationMinutes)}
              </span>
            }
          />
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground nums">
            <span>{formatArabicDate(trip.departureAt)}</span>
            <span className="font-semibold text-foreground">
              {formatTime(trip.departureAt)}
            </span>
          </div>
        </CardContent>
      </Card>

      <SeatMap trip={trip} />
    </AppShell>
  );
}
