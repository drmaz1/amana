import { PackageSearch, SearchX, Ticket } from "lucide-react";

import { trackByReference } from "@/lib/data";
import { formatArabicDate, formatIQD, formatTime } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { RouteLine } from "@/components/route-line";
import {
  BookingStatusBadge,
  ParcelStatusBadge,
} from "@/components/status-badge";
import { TrackForm } from "@/components/track-form";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "تتبّع الحجز أو الأمانة" };

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

export default async function TrackPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  const ref = searchParams.ref?.trim();
  const result = ref ? await trackByReference(ref) : null;

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
            <PackageSearch className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold">تتبّع طلبك</h1>
            <p className="text-sm text-muted-foreground">
              أدخل رقم الحجز (AMN-) أو رقم الأمانة (PKG-) لمعرفة الحالة.
            </p>
          </div>
        </div>

        <TrackForm />

        {ref && !result && (
          <div className="mt-6 rounded-xl border border-dashed bg-card p-8 text-center">
            <SearchX className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <h2 className="mt-3 font-semibold">لم نجد طلباً بهذا الرقم</h2>
            <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
              تأكّد من الرقم وحاول مرة أخرى. الأرقام تبدأ بـ AMN- أو PKG-.
            </p>
          </div>
        )}

        {result && (
          <Card className="mt-6">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Ticket className="h-4 w-4" />
                  {result.kind === "booking" ? "رقم الحجز" : "رقم الأمانة"}
                </span>
                <span className="font-display text-lg font-extrabold tracking-wider text-primary nums">
                  {result.reference}
                </span>
              </div>
              <Separator className="my-4" />
              <RouteLine
                originId={result.originId}
                destinationId={result.destinationId}
                size="sm"
              />
              <div className="mt-4 grid gap-2.5 text-sm">
                <Row
                  label="الحالة"
                  value={
                    result.kind === "booking" ? (
                      <BookingStatusBadge status={result.status} />
                    ) : (
                      <ParcelStatusBadge status={result.status} />
                    )
                  }
                />
                {result.kind === "booking" ? (
                  <>
                    {result.departureAt && (
                      <Row
                        label="الموعد"
                        value={`${formatArabicDate(result.departureAt)} — ${formatTime(result.departureAt)}`}
                      />
                    )}
                    <Row
                      label="المقاعد"
                      value={result.seatNumbers.map(arNum).join("، ")}
                    />
                    <Row label="الراكب" value={result.name} />
                    <Row
                      label="الإجمالي"
                      value={
                        <span className="font-semibold text-primary nums">
                          {formatIQD(result.totalPrice)}
                        </span>
                      }
                    />
                  </>
                ) : (
                  <>
                    <Row label="المحتوى" value={result.description} />
                    <Row label="المُرسِل" value={result.name} />
                    <Row
                      label="السعر"
                      value={
                        <span className="font-semibold text-primary nums">
                          {formatIQD(result.price)}
                        </span>
                      }
                    />
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-end font-medium nums">{value}</span>
    </div>
  );
}
