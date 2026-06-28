"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Car, Loader2, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { createVehicle, updateVehicle } from "@/lib/actions/vehicle";
import { seatsForVehicle, vehicleLabel } from "@/lib/seats";
import type { Vehicle, VehicleType } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

export function VehicleManager({ vehicles }: { vehicles: Vehicle[] }) {
  const [adding, setAdding] = React.useState(false);
  const [editing, setEditing] = React.useState<Vehicle | null>(null);

  return (
    <div className="grid gap-3">
      {adding || editing ? (
        <VehicleForm
          key={editing?.id ?? "new"}
          vehicle={editing ?? undefined}
          onDone={() => {
            setAdding(false);
            setEditing(null);
          }}
          onCancel={() => {
            setAdding(false);
            setEditing(null);
          }}
        />
      ) : (
        <Button
          variant="accent"
          className="w-full"
          onClick={() => setAdding(true)}
        >
          <Plus className="h-4 w-4" />
          أضف مركبة
        </Button>
      )}

      {vehicles.map((v) => (
        <Card key={v.id}>
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground">
                <Car className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="truncate font-semibold">{v.model}</div>
                <div className="text-xs text-muted-foreground">
                  {vehicleLabel(v.type)} · <span className="nums">{v.plate}</span>{" "}
                  · <span className="nums">{arNum(v.seats)}</span> مقاعد
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="shrink-0"
              onClick={() => setEditing(v)}
            >
              <Pencil className="h-4 w-4" />
              تعديل
            </Button>
          </CardContent>
        </Card>
      ))}

      {vehicles.length === 0 && !adding && (
        <div className="rounded-xl border border-dashed bg-card/50 p-8 text-center text-sm text-muted-foreground">
          لا مركبات مسجّلة بعد. أضف مركبتك الأولى.
        </div>
      )}
    </div>
  );
}

function VehicleForm({
  vehicle,
  onDone,
  onCancel,
}: {
  vehicle?: Vehicle;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();
  const isEdit = !!vehicle;
  const [type, setType] = React.useState<VehicleType>(vehicle?.type ?? "SEDAN");
  const [model, setModel] = React.useState(vehicle?.model ?? "");
  const [plate, setPlate] = React.useState(vehicle?.plate ?? "");
  const [busy, setBusy] = React.useState(false);

  const valid = model.trim().length >= 2 && plate.trim().length >= 2;

  async function submit() {
    if (!valid || busy) return;
    setBusy(true);
    const payload = { type, model: model.trim(), plate: plate.trim() };
    const res = isEdit
      ? await updateVehicle(vehicle.id, payload)
      : await createVehicle(payload);
    if (res.ok) {
      toast.success(isEdit ? "تم حفظ المركبة" : "تمت إضافة المركبة");
      router.refresh();
      onDone();
      return;
    }
    setBusy(false);
    toast.error(res.error);
  }

  return (
    <Card className="border-accent/40">
      <CardContent className="grid gap-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold">
            {isEdit ? "تعديل المركبة" : "مركبة جديدة"}
          </h3>
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

        <div className="grid gap-1.5">
          <Label htmlFor="v-type">نوع المركبة</Label>
          <Select value={type} onValueChange={(v) => setType(v as VehicleType)}>
            <SelectTrigger id="v-type">
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
          <p className="text-[11px] text-muted-foreground nums">
            {arNum(seatsForVehicle(type))} مقاعد للركّاب
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="v-model">الموديل</Label>
          <Input
            id="v-model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="تويوتا أفالون 2019"
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="v-plate">رقم اللوحة</Label>
          <Input
            id="v-plate"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder="بغداد ٢٢ أ ٤٥٦٧"
            className="nums"
          />
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" onClick={submit} disabled={!valid || busy}>
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جارٍ الحفظ…
              </>
            ) : (
              <>
                {isEdit ? (
                  <Pencil className="h-4 w-4" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {isEdit ? "حفظ" : "إضافة"}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={busy}>
            إلغاء
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
