"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeftRight,
  CheckCircle2,
  Home,
  Loader2,
  Package,
  Search,
} from "lucide-react";

import { toast } from "sonner";

import { createParcel } from "@/lib/actions/parcel";
import { GOVERNORATES, governorateName } from "@/lib/governorates";
import { isValidIraqiPhone } from "@/lib/phone";
import { estimateParcelPrice } from "@/lib/pricing";
import { formatIQD } from "@/lib/utils";
import { RouteLine } from "@/components/route-line";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const arNum = (n: number) => new Intl.NumberFormat("ar-IQ").format(n);

export function ParcelForm({
  defaultFrom = "baghdad",
  defaultTo = "basra",
}: {
  defaultFrom?: string;
  defaultTo?: string;
}) {
  const [from, setFrom] = React.useState(defaultFrom);
  const [to, setTo] = React.useState(defaultTo);
  const [sender, setSender] = React.useState("");
  const [receiver, setReceiver] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [weight, setWeight] = React.useState("1");

  const [status, setStatus] = React.useState<"idle" | "loading" | "done">(
    "idle",
  );
  const [reference, setReference] = React.useState("");

  const price = estimateParcelPrice(Number(weight));
  const sameCity = from === to;
  const valid =
    !sameCity &&
    sender.trim().length >= 2 &&
    receiver.trim().length >= 2 &&
    isValidIraqiPhone(phone) &&
    description.trim().length >= 2;

  function swap() {
    setFrom(to);
    setTo(from);
  }

  async function submit() {
    if (!valid || status === "loading") return;
    setStatus("loading");
    const res = await createParcel({
      originId: from,
      destinationId: to,
      senderName: sender.trim(),
      receiverName: receiver.trim(),
      receiverPhone: phone.trim(),
      description: description.trim(),
      weightKg: Number(weight),
    });
    if (res.ok) {
      setReference(res.reference);
      setStatus("done");
      toast.success("تم استلام طلب الأمانة");
      return;
    }
    setStatus("idle");
    toast.error(res.error);
  }

  if (status === "done") {
    return (
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h1 className="font-display text-2xl font-extrabold">
          تم استلام طلب الأمانة!
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          سيتواصل معك سائق متوجّه إلى وجهتك لتأكيد الاستلام والسعر النهائي.
        </p>

        <div className="mt-5 rounded-xl border bg-card p-5 text-start shadow-sm">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="h-4 w-4" />
              رقم الطلب
            </span>
            <span className="font-display text-lg font-extrabold tracking-wider text-primary nums">
              {reference}
            </span>
          </div>
          <Separator className="my-4" />
          <RouteLine originId={from} destinationId={to} size="sm" />
          <div className="mt-3 grid gap-2 text-sm">
            <Row label="المُرسِل" value={sender} />
            <Row label="المُستلِم" value={receiver} />
            <Row label="هاتف المُستلِم" value={phone} mono />
            <Row label="الوصف" value={description} />
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="font-medium">السعر التقديري</span>
            <span className="font-display text-xl font-extrabold text-primary nums">
              {formatIQD(price)}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          <Button asChild variant="outline">
            <Link href={`/track?ref=${reference}`}>
              <Package className="h-4 w-4" />
              تتبّع الأمانة
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
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Package className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold">إرسال أمانة</h1>
          <p className="text-sm text-muted-foreground">
            أرسل طرداً أو وثائق مع سائقي الرحلات بين المحافظات.
          </p>
        </div>
      </div>

      {/* route */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
          <div className="grid gap-1.5">
            <Label htmlFor="from">من</Label>
            <Select value={from} onValueChange={setFrom}>
              <SelectTrigger id="from" aria-label="محافظة الإرسال">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOVERNORATES.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={swap}
            aria-label="تبديل الوجهتين"
            className="mb-0.5 shrink-0"
          >
            <ArrowLeftRight className="h-4 w-4" />
          </Button>
          <div className="grid gap-1.5">
            <Label htmlFor="to">إلى</Label>
            <Select value={to} onValueChange={setTo}>
              <SelectTrigger id="to" aria-label="محافظة الاستلام">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GOVERNORATES.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.ar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {sameCity && (
          <p className="mt-2 text-center text-xs text-destructive">
            اختر محافظتين مختلفتين للإرسال والاستلام.
          </p>
        )}
      </div>

      {/* parties */}
      <div className="mt-4 grid gap-4 rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-1.5">
          <Label htmlFor="sender">اسم المُرسِل</Label>
          <Input
            id="sender"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            placeholder="اسمك"
            autoComplete="name"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="receiver">اسم المُستلِم</Label>
          <Input
            id="receiver"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="اسم من يستلم الأمانة"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="rphone">هاتف المُستلِم</Label>
          <Input
            id="rphone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XXXXXXXXX"
            className="nums"
          />
        </div>
      </div>

      {/* parcel details */}
      <div className="mt-4 grid gap-4 rounded-xl border bg-card p-5 shadow-sm">
        <div className="grid gap-1.5">
          <Label htmlFor="desc">وصف المحتوى</Label>
          <Textarea
            id="desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="مثال: وثائق رسمية، قطعة غيار، علبة صغيرة…"
            rows={3}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="weight">الوزن التقريبي (كغ)</Label>
          <Input
            id="weight"
            type="number"
            inputMode="decimal"
            min={1}
            step={1}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="nums"
          />
        </div>
      </div>

      {/* estimate + submit */}
      <div className="sticky bottom-20 z-10 mt-5 rounded-xl border bg-card p-4 shadow-lg md:bottom-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground">
              السعر التقديري — يُؤكَّد مع السائق
            </div>
            <div className="font-display text-2xl font-extrabold text-primary nums">
              {formatIQD(price)}
            </div>
          </div>
          <div className="text-end text-[11px] text-muted-foreground nums">
            {governorateName(from)} ← {governorateName(to)}
          </div>
        </div>
        <Button
          size="lg"
          className="w-full text-base"
          disabled={!valid || status === "loading"}
          onClick={submit}
        >
          {status === "loading" ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جارٍ الإرسال…
            </>
          ) : (
            <>
              <Package className="h-5 w-5" />
              إرسال الطلب
            </>
          )}
        </Button>
      </div>

      <Button asChild variant="ghost" className="mt-3 w-full">
        <Link href="/search">
          <Search className="h-4 w-4" />
          أريد حجز مقعد بدلاً من ذلك
        </Link>
      </Button>
    </div>
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
      <span className={mono ? "text-end font-medium nums" : "text-end font-medium"}>
        {value}
      </span>
    </div>
  );
}
