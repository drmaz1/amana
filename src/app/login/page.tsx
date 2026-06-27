import Link from "next/link";
import { Car, LayoutDashboard, Phone, ShieldCheck } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { AmanaMark } from "@/components/amana-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-sm">
        <div className="flex flex-col items-center text-center">
          <AmanaMark className="h-14 w-14" />
          <h1 className="mt-4 font-display text-2xl font-extrabold">
            تسجيل الدخول
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            سجّل دخولك برقم هاتفك عبر رمز تحقق (OTP).
          </p>
        </div>

        <Card className="mt-6">
          <CardContent className="grid gap-4 p-5">
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
                  disabled
                />
              </div>
            </div>
            <Button size="lg" className="w-full" disabled>
              إرسال رمز التحقق
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              تسجيل الدخول عبر OTP مُخطّط له في المرحلة القادمة من المشروع.
            </p>
          </CardContent>
        </Card>

        {/* demo quick-access */}
        <div className="mt-6">
          <div className="mb-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            دخول تجريبي للعرض
            <span className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-2">
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/driver">
                <Car className="h-4 w-4" />
                لوحة السائق
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/admin">
                <LayoutDashboard className="h-4 w-4" />
                لوحة الإدارة
              </Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          بياناتك محفوظة بأمان — أمانة.
        </div>
      </div>
    </AppShell>
  );
}
