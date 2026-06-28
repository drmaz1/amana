import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarDays,
  Clock,
  Info,
  Package,
  Phone,
  Star,
  Users,
} from "lucide-react";

import { getTrip } from "@/lib/data";
import { governorateName } from "@/lib/governorates";
import { vehicleLabel } from "@/lib/seats";
import {
  formatArabicDate,
  formatDuration,
  formatIQD,
  formatTime,
} from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { RouteLine } from "@/components/route-line";
import { TripStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const trip = await getTrip(params.id);
  if (!trip) return { title: "رحلة غير موجودة" };
  return {
    title: `${governorateName(trip.originId)} ← ${governorateName(trip.destinationId)}`,
    description: `رحلة مع ${trip.driver.name} — احجز مقعدك على أمانة.`,
  };
}

export default async function TripDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const trip = await getTrip(params.id);
  if (!trip) notFound();

  const available = trip.totalSeats - trip.bookedSeats.length;
  const soldOut = available <= 0;

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-lg font-bold">تفاصيل الرحلة</h1>
        <TripStatusBadge status={trip.status} />
      </div>

      {/* route + timing */}
      <Card>
        <CardContent className="p-5">
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
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="nums">{formatArabicDate(trip.departureAt)}</span>
            </div>
            <div className="flex items-center justify-end gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold nums">
                {formatTime(trip.departureAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* driver */}
      <Card className="mt-4">
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary font-display text-lg font-bold text-secondary-foreground">
            {trip.driver.name.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate font-semibold">{trip.driver.name}</div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground nums">
              <span className="inline-flex items-center gap-0.5 text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {trip.driver.rating.toFixed(1)}
              </span>
              <span>•</span>
              <span>{arNum(trip.driver.tripsCount)} رحلة</span>
            </div>
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0">
            <a href={`tel:${trip.driver.phone}`}>
              <Phone className="h-4 w-4" />
              اتصال
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* vehicle + seats */}
      <Card className="mt-4">
        <CardContent className="grid gap-3 p-4 text-sm">
          <Row label="المركبة" value={`${vehicleLabel(trip.vehicleType)} — ${trip.vehicleModel}`} />
          <Row label="رقم اللوحة" value={trip.plate} mono />
          <Row
            label="المقاعد المتاحة"
            value={
              <span className="inline-flex items-center gap-1.5 font-semibold nums">
                <Users className="h-4 w-4 text-muted-foreground" />
                {soldOut
                  ? "مكتمل"
                  : `${arNum(available)} من ${arNum(trip.totalSeats)}`}
              </span>
            }
          />
          <Row
            label="نقل الأمانات"
            value={
              trip.acceptsParcels ? (
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <Package className="h-4 w-4" />
                  متاح
                  {trip.parcelBasePrice
                    ? ` — من ${formatIQD(trip.parcelBasePrice)}`
                    : ""}
                </span>
              ) : (
                <span className="text-muted-foreground">غير متاح</span>
              )
            }
          />
        </CardContent>
      </Card>

      {trip.notes && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/10 p-3 text-sm">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent-foreground" />
          <p className="text-accent-foreground">{trip.notes}</p>
        </div>
      )}

      {/* sticky booking bar */}
      <div className="sticky bottom-20 z-10 mt-6 flex items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-lg md:bottom-4">
        <div>
          <div className="text-xs text-muted-foreground">تبدأ المقاعد من</div>
          <div className="font-display text-xl font-extrabold text-primary nums">
            {formatIQD(trip.pricePerSeat)}
          </div>
        </div>
        {soldOut ? (
          <Button size="lg" disabled>
            مكتمل
          </Button>
        ) : (
          <Button asChild size="lg">
            <Link href={`/trips/${trip.id}/seats`}>اختر مقعدك</Link>
          </Button>
        )}
      </div>

      {trip.acceptsParcels && (
        <Button asChild variant="ghost" className="mt-3 w-full">
          <Link href={`/parcels/new?from=${trip.originId}&to=${trip.destinationId}`}>
            <Package className="h-4 w-4" />
            أرسل أمانة مع هذه الرحلة
          </Link>
        </Button>
      )}
    </AppShell>
  );
}

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "nums font-medium" : "font-medium"}>{value}</span>
    </div>
  );
}
