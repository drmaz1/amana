"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Loader2,
  Package,
  Plus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";

import type { Booking, Trip, VehicleType } from "@/types";
import { cancelTrip, createTrip, setTripStatus } from "@/lib/actions/trip";
import { GOVERNORATES } from "@/lib/governorates";
import {
  categoryLabel,
  getSeatLayout,
  suggestSeatPrices,
  vehicleLabel,
  type SeatCategory,
} from "@/lib/seats";
import {
  formatArabicDate,
  formatIQD,
  formatTime,
} from "@/lib/utils";
import { RouteLine } from "@/components/route-line";
import { TripCard } from "@/components/trip-card";
import { BookingStatusBadge, TripStatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

const VEHICLE_OPTIONS: { value: VehicleType; label: string }[] = [
  { value: "SEDAN", label: "صالون (٤ ركاب)" },
  { value: "SUV", label: "SUV (٦ ركاب)" },
  { value: "GMC", label: "GMC (٧ ركاب)" },
];

function StatCard({
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
          <div className="font-display text-xl font-extrabold nums">{value}</div>
          <div className="truncate text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DriverDashboard({
  initialTrips,
  bookings,
}: {
  initialTrips: Trip[];
  bookings: Booking[];
}) {
  const router = useRouter();
  const [showForm, setShowForm] = React.useState(false);
  const [justAdded, setJustAdded] = React.useState(false);

  // Server data is the source of truth; a created trip arrives via router.refresh().
  const trips = initialTrips;

  const tripById = React.useMemo(() => {
    const m = new Map<string, Trip>();
    for (const t of trips) m.set(t.id, t);
    return m;
  }, [trips]);

  const seatsBooked = trips.reduce((sum, t) => sum + t.bookedSeats.length, 0);

  function handleAdded() {
    setShowForm(false);
    setJustAdded(true);
    router.refresh();
    setTimeout(() => setJustAdded(false), 3500);
  }

  return (
    <>
      <div className="mb-4">
        <h1 className="font-display text-xl font-bold">لوحة السائق</h1>
        <p className="text-sm text-muted-foreground">
          أهلاً {initialTrips[0]?.driver.name ?? "بك"} — أدِر رحلاتك وحجوزاتك.
        </p>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Car className="h-5 w-5" />}
          label="رحلاتي"
          value={arNum(trips.length)}
        />
        <StatCard
          icon={<Users className="h-5 w-5" />}
          label="مقاعد محجوزة"
          value={arNum(seatsBooked)}
        />
        <StatCard
          icon={<Package className="h-5 w-5" />}
          label="حجوزات"
          value={arNum(bookings.length)}
        />
      </div>

      {justAdded && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          تمت إضافة الرحلة وظهرت في قائمة رحلاتك.
        </div>
      )}

      <Tabs defaultValue="trips" className="mt-5">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trips">رحلاتي</TabsTrigger>
          <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
        </TabsList>

        {/* trips tab */}
        <TabsContent value="trips">
          {showForm ? (
            <AddTripForm
              onAdded={handleAdded}
              onCancel={() => setShowForm(false)}
            />
          ) : (
            <Button
              variant="accent"
              className="mb-4 w-full"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
              أضف رحلة جديدة
            </Button>
          )}

          <div className="grid gap-3">
            {trips.map((t) => (
              <div key={t.id} className="grid gap-2">
                <TripCard trip={t} />
                <DriverTripControls trip={t} />
              </div>
            ))}
            {trips.length === 0 && (
              <EmptyState text="لا توجد رحلات بعد. أضف رحلتك الأولى." />
            )}
          </div>
        </TabsContent>

        {/* bookings tab */}
        <TabsContent value="bookings">
          <div className="grid gap-3">
            {bookings.map((b) => {
              const trip = tripById.get(b.tripId);
              return (
                <Card key={b.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold">{b.passengerName}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground nums">
                          المقاعد: {b.seatNumbers.map(arNum).join("، ")}
                        </div>
                      </div>
                      <BookingStatusBadge status={b.status} />
                    </div>

                    {trip && (
                      <>
                        <div className="my-3 h-px bg-border" />
                        <RouteLine
                          originId={trip.originId}
                          destinationId={trip.destinationId}
                          size="sm"
                        />
                        <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground nums">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatArabicDate(trip.departureAt)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(trip.departureAt)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        إجمالي الحجز
                      </span>
                      <span className="font-display font-extrabold text-primary nums">
                        {formatIQD(b.totalPrice)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {bookings.length === 0 && (
              <EmptyState text="لا توجد حجوزات على رحلاتك حتى الآن." />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
}

/** Per-trip status controls shown under each card on the driver's dashboard. */
function DriverTripControls({ trip }: { trip: Trip }) {
  const router = useRouter();
  const [busy, setBusy] = React.useState(false);

  async function apply(
    status: "ONGOING" | "COMPLETED" | "CANCELLED",
    successText: string,
  ) {
    if (busy) return;
    if (status === "CANCELLED" && !window.confirm("هل تريد إلغاء هذه الرحلة؟")) {
      return;
    }
    setBusy(true);
    const res =
      status === "CANCELLED"
        ? await cancelTrip(trip.id)
        : await setTripStatus(trip.id, status);
    setBusy(false);
    if (res.ok) {
      toast.success(successText);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="-mt-1 flex flex-wrap items-center gap-2 px-1 pb-1">
      <TripStatusBadge status={trip.status} />
      {trip.status === "SCHEDULED" && (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={busy}
            onClick={() => apply("ONGOING", "بدأت الرحلة")}
          >
            بدء الرحلة
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            disabled={busy}
            onClick={() => apply("CANCELLED", "أُلغيت الرحلة")}
          >
            <X className="h-4 w-4" />
            إلغاء
          </Button>
        </>
      )}
      {trip.status === "ONGOING" && (
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => apply("COMPLETED", "اكتملت الرحلة")}
        >
          <CheckCircle2 className="h-4 w-4" />
          إنهاء الرحلة
        </Button>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

/** Add-trip form — persists via the createTrip server action. */
function AddTripForm({
  onAdded,
  onCancel,
}: {
  onAdded: () => void;
  onCancel: () => void;
}) {
  const [from, setFrom] = React.useState("baghdad");
  const [to, setTo] = React.useState("basra");
  const [date, setDate] = React.useState("");
  const [time, setTime] = React.useState("08:00");
  const [vehicleType, setVehicleType] = React.useState<VehicleType>("SEDAN");
  const [model, setModel] = React.useState("");
  const [hours, setHours] = React.useState("4");
  const [basePrice, setBasePrice] = React.useState(25000);
  const [seatPrices, setSeatPrices] = React.useState<number[]>(() =>
    suggestSeatPrices("SEDAN", 25000),
  );
  const [parcels, setParcels] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);

  const seatCells = React.useMemo(() => {
    const cells: { n: number; category: SeatCategory }[] = [];
    for (const row of getSeatLayout(vehicleType))
      for (const c of row)
        if (c.kind === "seat") cells.push({ n: c.n, category: c.category });
    return cells.sort((a, b) => a.n - b.n);
  }, [vehicleType]);

  function applyType(v: VehicleType) {
    setVehicleType(v);
    setSeatPrices(suggestSeatPrices(v, basePrice || 1000));
  }
  function applyBase(value: number) {
    setBasePrice(value);
    setSeatPrices(suggestSeatPrices(vehicleType, value || 1000));
  }
  function setSeatPrice(i: number, value: number) {
    setSeatPrices((prev) => prev.map((p, idx) => (idx === i ? value : p)));
  }

  const valid =
    from !== to &&
    !!date &&
    !!time &&
    model.trim().length >= 2 &&
    seatPrices.length >= 1 &&
    seatPrices.every((p) => p > 0);

  async function submit() {
    if (!valid || submitting) return;
    setSubmitting(true);
    const departureAt = new Date(`${date}T${time}:00`).toISOString();
    const res = await createTrip({
      originId: from,
      destinationId: to,
      departureAt,
      durationMinutes: Math.max(30, Math.round(Number(hours) * 60)) || 180,
      vehicleType,
      vehicleModel: model.trim(),
      seatPrices: seatPrices.map((p) => Math.round(p)),
      acceptsParcels: parcels,
      parcelBasePrice: parcels ? 8000 : undefined,
    });
    if (res.ok) {
      toast.success("تمت إضافة الرحلة");
      onAdded();
      return;
    }
    setSubmitting(false);
    toast.error(res.error);
  }

  return (
    <Card className="mb-4 border-accent/40">
      <CardContent className="grid gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold">رحلة جديدة</h2>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            aria-label="إلغاء"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="t-from">من</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger id="t-from">
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
          <div className="grid gap-1.5">
            <Label htmlFor="t-to">إلى</Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger id="t-to">
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

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="t-date">التاريخ</Label>
            <Input
              id="t-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="nums"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="t-time">وقت الانطلاق</Label>
            <Input
              id="t-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="t-type">نوع المركبة</Label>
            <Select
              value={vehicleType}
              onValueChange={(v) => applyType(v as VehicleType)}
            >
              <SelectTrigger id="t-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VEHICLE_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="t-model">موديل المركبة</Label>
            <Input
              id="t-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="تويوتا أفالون 2019"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="t-hours">المدة (ساعة)</Label>
            <Input
              id="t-hours"
              type="number"
              min={1}
              step={1}
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="nums"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="t-base">السعر الأساسي (مقعد شباك)</Label>
            <Input
              id="t-base"
              type="number"
              min={1000}
              step={1000}
              value={basePrice}
              onChange={(e) => applyBase(Number(e.target.value))}
              className="nums"
            />
          </div>
        </div>

        {/* per-seat prices — pre-filled from the base, editable */}
        <div className="grid gap-2 rounded-lg border bg-secondary/20 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">سعر كل مقعد</span>
            <span className="text-[11px] text-muted-foreground">
              {vehicleLabel(vehicleType)} · {arNum(seatCells.length)} مقاعد
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {seatCells.map((s, i) => (
              <div key={s.n} className="grid gap-1">
                <Label
                  htmlFor={`t-seat-${s.n}`}
                  className="text-[11px] text-muted-foreground"
                >
                  مقعد {arNum(s.n)} · {categoryLabel(s.category)}
                </Label>
                <Input
                  id={`t-seat-${s.n}`}
                  type="number"
                  min={1000}
                  step={1000}
                  value={seatPrices[i] ?? ""}
                  onChange={(e) => setSeatPrice(i, Number(e.target.value))}
                  className="nums h-9"
                />
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2.5 rounded-lg border bg-secondary/30 p-3 text-sm">
          <input
            type="checkbox"
            checked={parcels}
            onChange={(e) => setParcels(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--primary))]"
          />
          <span className="inline-flex items-center gap-1.5">
            <Package className="h-4 w-4 text-primary" />
            أستقبل أمانات على هذه الرحلة
          </span>
        </label>

        {from === to && (
          <p className="text-xs text-destructive">
            اختر محافظتين مختلفتين.
          </p>
        )}

        <div className="flex gap-2">
          <Button
            className="flex-1"
            onClick={submit}
            disabled={!valid || submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جارٍ الإضافة…
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                إضافة الرحلة
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={submitting}>
            إلغاء
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
