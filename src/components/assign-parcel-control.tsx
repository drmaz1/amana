"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { assignParcelToTrip } from "@/lib/actions/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "none";

export function AssignParcelControl({
  parcelId,
  currentTripId,
  candidates,
}: {
  parcelId: string;
  currentTripId: string | null;
  candidates: { id: string; label: string }[];
}) {
  const router = useRouter();
  const [val, setVal] = React.useState(currentTripId ?? NONE);
  const [busy, setBusy] = React.useState(false);

  async function change(next: string) {
    if (next === val || busy) return;
    const prev = val;
    setBusy(true);
    setVal(next);
    const res = await assignParcelToTrip(
      parcelId,
      next === NONE ? null : next,
    );
    setBusy(false);
    if (res.ok) {
      toast.success(next === NONE ? "أُلغي ربط الأمانة" : "رُبطت بالرحلة");
      router.refresh();
    } else {
      setVal(prev);
      toast.error(res.error);
    }
  }

  if (candidates.length === 0) {
    return (
      <span className="text-xs text-muted-foreground">لا رحلات على المسار</span>
    );
  }

  return (
    <Select value={val} onValueChange={change} disabled={busy}>
      <SelectTrigger className="h-8 w-[11rem] text-xs" aria-label="ربط بالرحلة">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE} className="text-xs">
          بدون رحلة
        </SelectItem>
        {candidates.map((c) => (
          <SelectItem key={c.id} value={c.id} className="text-xs">
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
