import Link from "next/link";
import { CalendarDays, Clock, Package, Ticket } from "lucide-react";

import { getMyBookings, getMyParcels } from "@/lib/data";
import { requireUser } from "@/lib/session";
import {
  formatArabicDate,
  formatIQD,
  formatTime,
} from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { ReviewForm } from "@/components/review-form";
import { RouteLine } from "@/components/route-line";
import { Stars } from "@/components/stars";
import {
  BookingStatusBadge,
  ParcelStatusBadge,
} from "@/components/status-badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = { title: "رحلاتي وأماناتي" };

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

export default async function MePage() {
  const session = await requireUser("/me");
  const [bookings, parcels] = await Promise.all([
    getMyBookings(session.userId),
    getMyParcels(session.userId),
  ]);

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="font-display text-xl font-bold">رحلاتي وأماناتي</h1>
        <p className="text-sm text-muted-foreground">
          متابعة حجوزاتك وطلبات الأمانة الخاصة بك.
        </p>
      </div>

      <Tabs defaultValue="bookings">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bookings">
            حجوزاتي ({arNum(bookings.length)})
          </TabsTrigger>
          <TabsTrigger value="parcels">
            أماناتي ({arNum(parcels.length)})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <div className="grid gap-3">
            {bookings.map((b) => (
              <Card key={b.reference}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Link
                      href={`/track?ref=${b.reference}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary nums hover:underline"
                    >
                      <Ticket className="h-4 w-4" />
                      {b.reference}
                    </Link>
                    <BookingStatusBadge status={b.status} />
                  </div>
                  <RouteLine
                    originId={b.originId}
                    destinationId={b.destinationId}
                    size="sm"
                  />
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground nums">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatArabicDate(b.departureAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {formatTime(b.departureAt)}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                    <span className="text-muted-foreground">
                      المقاعد: {b.seatNumbers.map(arNum).join("، ")}
                    </span>
                    <span className="font-display font-extrabold text-primary nums">
                      {formatIQD(b.totalPrice)}
                    </span>
                  </div>

                  {b.status === "COMPLETED" && (
                    <div className="mt-3">
                      {b.myRating ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          تقييمك للسائق:
                          <Stars value={b.myRating} />
                        </div>
                      ) : (
                        <ReviewForm
                          bookingId={b.bookingId}
                          driverName={b.driverName}
                        />
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {bookings.length === 0 && (
              <Empty text="لا توجد حجوزات بعد." />
            )}
          </div>
        </TabsContent>

        <TabsContent value="parcels">
          <div className="grid gap-3">
            {parcels.map((p) => (
              <Card key={p.reference}>
                <CardContent className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <Link
                      href={`/track?ref=${p.reference}`}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary nums hover:underline"
                    >
                      <Package className="h-4 w-4" />
                      {p.reference}
                    </Link>
                    <ParcelStatusBadge status={p.status} />
                  </div>
                  <RouteLine
                    originId={p.originId}
                    destinationId={p.destinationId}
                    size="sm"
                  />
                  <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                    <span className="truncate text-muted-foreground">
                      {p.description}
                    </span>
                    <span className="font-display font-extrabold text-primary nums">
                      {formatIQD(p.price)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {parcels.length === 0 && (
              <Empty text="لا توجد أمانات بعد." />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}
