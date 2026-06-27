import Link from "next/link";
import { Clock, Package, Star, Users } from "lucide-react";

import type { Trip } from "@/types";
import {
  formatArabicDate,
  formatDuration,
  formatIQD,
  formatTime,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RouteLine } from "@/components/route-line";

const VEHICLE_LABEL: Record<Trip["vehicleType"], string> = {
  SEDAN: "صالون",
  VAN: "كيا / فان",
  BUS: "باص",
};

export function TripCard({ trip, href }: { trip: Trip; href?: string }) {
  const available = trip.totalSeats - trip.bookedSeats.length;
  const link = href ?? `/trips/${trip.id}`;
  const numberFmt = new Intl.NumberFormat("ar-IQ");

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <RouteLine
          originId={trip.originId}
          destinationId={trip.destinationId}
          middle={
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(trip.durationMinutes)}
            </span>
          }
        />

        <div className="mt-3 flex items-center justify-between text-sm">
          <div className="font-semibold text-foreground nums">
            {formatTime(trip.departureAt)}
          </div>
          <div className="text-muted-foreground nums">
            {formatArabicDate(trip.departureAt)}
          </div>
        </div>

        <div className="my-3 h-px bg-border" />

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 truncate text-sm font-semibold">
              {trip.driver.name}
              <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-600 nums">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {trip.driver.rating.toFixed(1)}
              </span>
            </div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {VEHICLE_LABEL[trip.vehicleType]} • {trip.vehicleModel}
            </div>
          </div>
          <div className="shrink-0 text-end">
            <div className="font-display text-lg font-extrabold text-primary nums">
              {formatIQD(trip.pricePerSeat)}
            </div>
            <div className="text-[11px] text-muted-foreground">للمقعد</div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 nums">
            <Users className="h-3.5 w-3.5" />
            {available > 0
              ? `${numberFmt.format(available)} مقاعد متاحة`
              : "مكتمل"}
          </span>
          {trip.acceptsParcels && (
            <span className="inline-flex items-center gap-1 text-primary">
              <Package className="h-3.5 w-3.5" />
              يستقبل أمانات
            </span>
          )}
        </div>

        <Button
          asChild
          className="mt-4 w-full"
          variant={available > 0 ? "default" : "secondary"}
        >
          <Link href={link}>
            {available > 0 ? "عرض التفاصيل والحجز" : "عرض التفاصيل"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
