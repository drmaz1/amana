"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2, Phone, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { requestOtp, verifyOtp } from "@/lib/actions/auth";
import { isValidIraqiPhone } from "@/lib/phone";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState<"phone" | "code">("phone");
  const [phone, setPhone] = React.useState("");
  const [code, setCode] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [devCode, setDevCode] = React.useState<string | null>(null);

  const phoneValid = isValidIraqiPhone(phone);
  const codeValid = /^\d{6}$/.test(code);

  async function sendCode() {
    if (!phoneValid || busy) return;
    setBusy(true);
    const res = await requestOtp({ phone: phone.trim() });
    setBusy(false);
    if (res.ok) {
      setStep("code");
      setDevCode(res.devCode ?? null);
      toast.success("أرسلنا رمز التحقق إلى هاتفك");
    } else {
      toast.error(res.error);
    }
  }

  async function confirmCode() {
    if (!codeValid || busy) return;
    setBusy(true);
    const res = await verifyOtp({ phone: phone.trim(), code: code.trim() });
    setBusy(false);
    if (res.ok) {
      toast.success("تم تسجيل الدخول");
      router.push(next || "/");
      router.refresh();
    } else {
      toast.error(res.error);
      if (res.code === "NO_CODE" || res.code === "TOO_MANY") setStep("phone");
    }
  }

  return (
    <Card className="mt-6">
      <CardContent className="grid gap-4 p-5">
        {step === "phone" ? (
          <>
            <div className="grid gap-1.5">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <div className="relative">
                <Phone className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="07XXXXXXXXX"
                  className="ps-3 pe-10 nums"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendCode()}
                  autoComplete="tel"
                  autoFocus
                />
              </div>
            </div>
            <Button
              size="lg"
              className="w-full"
              onClick={sendCode}
              disabled={!phoneValid || busy}
            >
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جارٍ الإرسال…
                </>
              ) : (
                "إرسال رمز التحقق"
              )}
            </Button>
          </>
        ) : (
          <>
            <div className="grid gap-1.5">
              <Label htmlFor="code">رمز التحقق</Label>
              <div className="relative">
                <KeyRound className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="______"
                  className="ps-3 pe-10 text-center text-lg tracking-[0.5em] nums"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  onKeyDown={(e) => e.key === "Enter" && confirmCode()}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>
              <p className="text-xs text-muted-foreground">
                أرسلنا رمزاً إلى{" "}
                <span className="font-medium nums">{phone}</span>.
              </p>
            </div>

            {devCode && (
              <div className="rounded-lg border border-accent/40 bg-accent/10 p-3 text-center text-sm text-accent-foreground">
                رمز التطوير:{" "}
                <span className="font-display text-lg font-extrabold tracking-widest nums">
                  {devCode}
                </span>
              </div>
            )}

            <Button
              size="lg"
              className="w-full"
              onClick={confirmCode}
              disabled={!codeValid || busy}
            >
              {busy ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  جارٍ التحقق…
                </>
              ) : (
                "تأكيد وتسجيل الدخول"
              )}
            </Button>
            <button
              type="button"
              className="text-center text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                setStep("phone");
                setCode("");
                setDevCode(null);
              }}
            >
              تغيير رقم الهاتف
            </button>
          </>
        )}

        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          بياناتك محفوظة بأمان — أمانة.
        </div>
      </CardContent>
    </Card>
  );
}
