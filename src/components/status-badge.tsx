import { Badge } from "@/components/ui/badge";
import type { BookingStatus, ParcelStatus, TripStatus } from "@/types";

type Variant = React.ComponentProps<typeof Badge>["variant"];

const TRIP: Record<TripStatus, { label: string; variant: Variant }> = {
  SCHEDULED: { label: "مجدولة", variant: "accent" },
  ONGOING: { label: "جارية", variant: "default" },
  COMPLETED: { label: "مكتملة", variant: "success" },
  CANCELLED: { label: "ملغاة", variant: "destructive" },
};

const BOOKING: Record<BookingStatus, { label: string; variant: Variant }> = {
  PENDING: { label: "بانتظار التأكيد", variant: "warning" },
  CONFIRMED: { label: "مؤكد", variant: "success" },
  CANCELLED: { label: "ملغى", variant: "destructive" },
  COMPLETED: { label: "منجز", variant: "secondary" },
};

const PARCEL: Record<ParcelStatus, { label: string; variant: Variant }> = {
  REQUESTED: { label: "طلب جديد", variant: "warning" },
  ACCEPTED: { label: "مقبول", variant: "accent" },
  IN_TRANSIT: { label: "قيد النقل", variant: "default" },
  DELIVERED: { label: "مُسلّم", variant: "success" },
  CANCELLED: { label: "ملغى", variant: "destructive" },
};

export function TripStatusBadge({ status }: { status: TripStatus }) {
  const s = TRIP[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const s = BOOKING[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}

export function ParcelStatusBadge({ status }: { status: ParcelStatus }) {
  const s = PARCEL[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}
