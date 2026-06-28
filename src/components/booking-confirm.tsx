"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Armchair,
  CalendarDays,
  CheckCircle2,
  Clock,
  Home,
  Loader2,
  Phone,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

import type { Trip } from "@/types";
import { createBooking } from "@/lib/actions/booking";
import { isValidIraqiPhone } from "@/lib/phone";
import {
  formatArabicDate,
  formatDuration,
  formatIQD,
  formatTime,
} from "@/lib/utils";
import { RouteLine } from "@/components/route-line";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

export function BookingConfirm({
  trip,
  seats,
}: {
  trip: Trip;
  seats: number[];
}) {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [status, setStatus] = React.useState<"idle" | "loading" | "done">(
    "idle",
  );
  const [reference, setReference] = React.useState("");

  const priceOf = (n: number) => trip.seatPrices[n - 1] ?? trip.pricePerSeat;
  const total = seats.reduce((s, n) => s + priceOf(n), 0);
  const valid = name.trim().length >= 2 && isValidIraqiPhone(phone);

  async function confirm() {
    if (!valid || status === "loading") return;
    setStatus("loading");
    const res = await createBooking({
      tripId: trip.id,
      seats,
      passengerName: name.trim(),
      passengerPhone: phone.trim(),
    });
    if (res.ok) {
      setReference(res.reference);
      setStatus("done");
      toast.success("تم تأكيد حجزك");
      return;
    }
    setStatus("idle");
    toast.error(res.error);
    if (res.code === "SEAT_TAKEN") {
      // The chosen seats were just taken — send the user back to re-pick.
      router.push(`/trips/${trip.id}/seats`);
    }
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h1 className="font-display text-2xl font-extrabold">تم تأكيد حجزك!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          احتفظ برقم الحجز وأظهره للسائق عند الصعود.
        </p>

        <Card className="mt-5 text-start">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <Ticket className="h-4 w-4" />
                رقم الحجز
              </span>
              <span className="font-display text-lg font-extrabold tracking-wider text-primary nums">
                {reference}
              </span>
            </div>
            <Separator className="my-4" />
            <RouteLine
              originId={trip.originId}
              destinationId={trip.destinationId}
              size="sm"
            />
            <div className="mt-3 grid gap-2 text-sm">
              <Row
                label="التاريخ والوقت"
                value={`${formatArabicDate(trip.departureAt)} — ${formatTime(
                  trip.departureAt,
                )}`}
              />
              <Row label="المقاعد" value={seats.map(arNum).join("، ")} />
              <Row label="الراكب" value={name} />
              <Row label="السائق" value={trip.driver.name} />
            </div>
            <Separator className="my-4" />
            <div className="flex items-center justify-between">
              <span className="font-medium">المبلغ المدفوع نقداً للسائق</span>
              <span className="font-display text-xl font-extrabold text-primary nums">
                {formatIQD(total)}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-5 grid gap-2">
          <Button asChild variant="outline">
            <a href={`tel:${trip.driver.phone}`}>
              <Phone className="h-4 w-4" />
              اتصل بالسائق
            </a>
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/track?ref=${reference}`}>
              <Ticket className="h-4 w-4" />
              تتبّع الحجز
            </Link>
          </Button>
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              العودة للرئيسية
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-1 font-display text-xl font-bold">تأكيد الحجز</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        راجع تفاصيل رحلتك وأدخل بياناتك لإتمام الحجز.
      </p>

      {/* trip + seats summary */}
      <Card>
        <CardContent className="p-5">
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
          <Separator className="my-4" />
          <div className="grid gap-2.5 text-sm">
            <Row
              label={
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  التاريخ
                </span>
              }
              value={formatArabicDate(trip.departureAt)}
            />
            <Row
              label={
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  وقت الانطلاق
                </span>
              }
              value={formatTime(trip.departureAt)}
            />
            <Row
              label={
                <span className="inline-flex items-center gap-1.5">
                  <Armchair className="h-4 w-4 text-muted-foreground" />
                  المقاعد ({arNum(seats.length)})
                </span>
              }
              value={
                <span className="grid gap-0.5 text-end">
                  {seats.map((n) => (
                    <span key={n} className="nums">
                      مقعد {arNum(n)} — {formatIQD(priceOf(n))}
                    </span>
                  ))}
                </span>
              }
            />
            <Row label="السائق" value={trip.driver.name} />
          </div>
        </CardContent>
      </Card>

      {/* passenger details */}
      <Card className="mt-4">
        <CardContent className="grid gap-4 p-5">
          <div className="grid gap-1.5">
            <Label htmlFor="name">اسم الراكب</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الكامل"
              autoComplete="name"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="phone">رقم الهاتف</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07XXXXXXXXX"
              autoComplete="tel"
              className="nums"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-3 rounded-xl border border-accent/30 bg-accent/10 p-3 text-center text-xs text-accent-foreground">
        الدفع نقداً للسائق عند الصعود — لا حاجة لبطاقة في هذه النسخة.
      </div>

      {/* total + confirm */}
      <div className="sticky bottom-20 z-10 mt-5 rounded-xl border bg-card p-4 shadow-lg md:bottom-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">
              الإجمالي ({arNum(seats.length)}{" "}
              {seats.length === 1 ? "مقعد" : "مقاعد"})
            </div>
            <div className="font-display text-2xl font-extrabold text-primary nums">
              {formatIQD(total)}
            </div>
          </div>
        </div>
        <Button
          size="lg"
          className="w-full text-base"
          disabled={!valid || status === "loading"}
          onClick={confirm}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جارٍ التأكيد…
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              تأكيد الحجز
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-medium">{value}</span>
    </div>
  );
}
