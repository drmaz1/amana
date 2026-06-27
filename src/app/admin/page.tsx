import { Car, Package, Ticket, Wallet } from "lucide-react";

import { getAllBookings, getAllParcels, getAllTrips } from "@/lib/data";
import { governorateName } from "@/lib/governorates";
import { formatArabicDate, formatIQD, formatTime } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import {
  BookingStatusBadge,
  ParcelStatusBadge,
  TripStatusBadge,
} from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

export default async function AdminPage() {
  const [trips, bookings, parcels] = await Promise.all([
    getAllTrips(),
    getAllBookings(),
    getAllParcels(),
  ]);

  const volume =
    bookings.reduce((s, b) => s + b.totalPrice, 0) +
    parcels.reduce((s, p) => s + p.price, 0);

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="font-display text-xl font-bold">لوحة الإدارة</h1>
        <p className="text-sm text-muted-foreground">
          نظرة عامة على الرحلات والحجوزات والأمانات في المنصة.
        </p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-3">
        <Stat
          icon={<Car className="h-5 w-5" />}
          label="إجمالي الرحلات"
          value={arNum(trips.length)}
        />
        <Stat
          icon={<Ticket className="h-5 w-5" />}
          label="إجمالي الحجوزات"
          value={arNum(bookings.length)}
        />
        <Stat
          icon={<Package className="h-5 w-5" />}
          label="إجمالي الأمانات"
          value={arNum(parcels.length)}
        />
        <Stat
          icon={<Wallet className="h-5 w-5" />}
          label="حجم المعاملات"
          value={formatIQD(volume)}
        />
      </div>

      {/* trips table */}
      <Section title="الرحلات">
        <Table head={["المسار", "التاريخ", "السائق", "المقاعد", "السعر", "الحالة"]}>
          {trips.map((t) => (
            <tr key={t.id} className="border-t">
              <Td>
                <RouteText from={t.originId} to={t.destinationId} />
              </Td>
              <Td className="nums whitespace-nowrap text-muted-foreground">
                {formatArabicDate(t.departureAt)}
                <span className="mx-1 opacity-50">•</span>
                {formatTime(t.departureAt)}
              </Td>
              <Td className="whitespace-nowrap">{t.driver.name}</Td>
              <Td className="nums">
                {arNum(t.bookedSeats.length)}/{arNum(t.totalSeats)}
              </Td>
              <Td className="nums whitespace-nowrap font-medium text-primary">
                {formatIQD(t.pricePerSeat)}
              </Td>
              <Td>
                <TripStatusBadge status={t.status} />
              </Td>
            </tr>
          ))}
        </Table>
      </Section>

      {/* bookings table */}
      <Section title="الحجوزات">
        <Table head={["الراكب", "المسار", "المقاعد", "الإجمالي", "الحالة"]}>
          {bookings.map((b) => {
            const trip = trips.find((t) => t.id === b.tripId);
            return (
              <tr key={b.id} className="border-t">
                <Td className="whitespace-nowrap">{b.passengerName}</Td>
                <Td>
                  {trip ? (
                    <RouteText from={trip.originId} to={trip.destinationId} />
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </Td>
                <Td className="nums">{b.seatNumbers.map(arNum).join("، ")}</Td>
                <Td className="nums whitespace-nowrap font-medium text-primary">
                  {formatIQD(b.totalPrice)}
                </Td>
                <Td>
                  <BookingStatusBadge status={b.status} />
                </Td>
              </tr>
            );
          })}
        </Table>
      </Section>

      {/* parcels table */}
      <Section title="الأمانات">
        <Table head={["المسار", "المُرسِل ← المُستلِم", "المحتوى", "السعر", "الحالة"]}>
          {parcels.map((p) => (
            <tr key={p.id} className="border-t">
              <Td>
                <RouteText from={p.originId} to={p.destinationId} />
              </Td>
              <Td className="whitespace-nowrap">
                {p.senderName} <span className="opacity-50">←</span>{" "}
                {p.receiverName}
              </Td>
              <Td className="max-w-[12rem] truncate text-muted-foreground">
                {p.description}
              </Td>
              <Td className="nums whitespace-nowrap font-medium text-primary">
                {formatIQD(p.price)}
              </Td>
              <Td>
                <ParcelStatusBadge status={p.status} />
              </Td>
            </tr>
          ))}
        </Table>
      </Section>
    </AppShell>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
          {icon}
        </div>
        <div className="min-w-0">
          <div className="font-display text-lg font-extrabold leading-tight nums">
            {value}
          </div>
          <div className="truncate text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <h2 className="mb-2 font-display text-base font-bold">{title}</h2>
      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">{children}</div>
      </div>
    </section>
  );
}

function Table({
  head,
  children,
}: {
  head: string[];
  children: React.ReactNode;
}) {
  return (
    <table className="w-full text-start text-sm">
      <thead>
        <tr className="bg-muted/50 text-xs text-muted-foreground">
          {head.map((h) => (
            <th key={h} className="px-3 py-2.5 text-start font-medium whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-3 py-2.5 align-middle ${className}`}>{children}</td>;
}

function RouteText({ from, to }: { from: string; to: string }) {
  return (
    <span className="whitespace-nowrap font-medium">
      {governorateName(from)}
      <span className="mx-1 text-accent">←</span>
      {governorateName(to)}
    </span>
  );
}
