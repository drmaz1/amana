"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setBookingStatus, setParcelStatus } from "@/lib/actions/admin";
import { setTripStatus } from "@/lib/actions/trip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Kind = "booking" | "parcel" | "trip";

const LABELS: Record<Kind, Record<string, string>> = {
  booking: {
    PENDING: "بانتظار التأكيد",
    CONFIRMED: "مؤكد",
    CANCELLED: "ملغى",
    COMPLETED: "منجز",
  },
  parcel: {
    REQUESTED: "طلب جديد",
    ACCEPTED: "مقبول",
    IN_TRANSIT: "قيد النقل",
    DELIVERED: "مُسلّم",
    CANCELLED: "ملغى",
  },
  trip: {
    SCHEDULED: "مجدولة",
    ONGOING: "جارية",
    COMPLETED: "مكتملة",
    CANCELLED: "ملغاة",
  },
};

export function AdminStatusControl({
  kind,
  id,
  status,
}: {
  kind: Kind;
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [val, setVal] = React.useState(status);
  const [busy, setBusy] = React.useState(false);

  async function change(next: string) {
    if (next === val || busy) return;
    const prev = val;
    setBusy(true);
    setVal(next);
    const res =
      kind === "booking"
        ? await setBookingStatus(
            id,
            next as Parameters<typeof setBookingStatus>[1],
          )
        : kind === "parcel"
          ? await setParcelStatus(
              id,
              next as Parameters<typeof setParcelStatus>[1],
            )
          : await setTripStatus(id, next as Parameters<typeof setTripStatus>[1]);
    setBusy(false);
    if (res.ok) {
      toast.success("تم تحديث الحالة");
      router.refresh();
    } else {
      setVal(prev);
      toast.error(res.error);
    }
  }

  return (
    <Select value={val} onValueChange={change} disabled={busy}>
      <SelectTrigger className="h-8 w-[8.5rem] text-xs" aria-label="تغيير الحالة">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LABELS[kind]).map(([v, label]) => (
          <SelectItem key={v} value={v} className="text-xs">
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
