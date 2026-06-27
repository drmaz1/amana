import Link from "next/link";
import { ArrowLeft, Package, ShieldCheck, Sparkles, Wallet } from "lucide-react";

import { getPopularRoutes } from "@/lib/data";
import { governorateName } from "@/lib/governorates";
import { formatIQD } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { SearchForm } from "@/components/search-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    title: "ابحث عن رحلتك",
    body: "اختر محافظة الانطلاق والوصول وتاريخ السفر لعرض الرحلات المتاحة.",
  },
  {
    title: "اختر مقعدك",
    body: "قارن الأسعار والسائقين، ثم احجز المقعد المناسب لك على المخطط.",
  },
  {
    title: "سافر بأمان",
    body: "تواصل مع السائق وأكّد موعد الانطلاق، وادفع نقداً عند الصعود.",
  },
];

export default async function HomePage() {
  const routes = await getPopularRoutes();

  return (
    <AppShell>
      {/* Hero — the search is the headline */}
      <section className="hero-wash -mx-4 rounded-b-3xl px-4 pb-6 pt-2">
        <div className="mb-5 max-w-md">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            سفر وأمانات بين كل المحافظات
          </span>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight text-foreground">
            احجز مقعدك،
            <br />
            وأرسل أمانتك بثقة.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            منصة عراقية تربطك بسائقين موثوقين للسفر بين المحافظات ونقل البريد
            والطرود — بسعر واضح وحجز بثوانٍ.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-4">
            <SearchForm />
          </CardContent>
        </Card>
      </section>

      {/* Popular routes */}
      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">وجهات شائعة</h2>
          <Link
            href="/search"
            className="text-sm font-medium text-primary hover:underline"
          >
            عرض الكل
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {routes.map((r) => (
            <Link
              key={`${r.originId}-${r.destinationId}`}
              href={`/search?from=${r.originId}&to=${r.destinationId}`}
              className="group rounded-xl border bg-card p-3 transition-colors hover:border-primary/50 hover:bg-secondary/40"
            >
              <div className="flex items-center gap-1.5 font-display text-sm font-bold">
                <span>{governorateName(r.originId)}</span>
                <ArrowLeft className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:-translate-x-0.5" />
                <span>{governorateName(r.destinationId)}</span>
              </div>
              <div className="mt-1.5 text-xs text-muted-foreground">
                تبدأ من{" "}
                <span className="font-semibold text-primary nums">
                  {formatIQD(r.fromPrice)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold">كيف تعمل أمانة؟</h2>
        <ol className="grid gap-3">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground nums">
                {new Intl.NumberFormat("ar-IQ").format(i + 1)}
              </span>
              <div>
                <h3 className="font-semibold leading-tight">{step.title}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Parcel CTA */}
      <section className="mt-10">
        <Card className="overflow-hidden border-primary/20 bg-primary text-primary-foreground">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/10">
              <Package className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-display text-base font-bold">
                عندك أمانة تريد توصيلها؟
              </h3>
              <p className="mt-0.5 text-sm text-primary-foreground/80">
                أرسل طرداً أو وثائق مع رحلة قادمة بين محافظتك ووجهتك.
              </p>
            </div>
            <Button asChild variant="accent" size="sm" className="shrink-0">
              <Link href="/parcels/new">أرسل أمانة</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Trust strip */}
      <section className="mt-8 grid grid-cols-3 gap-3 text-center">
        {[
          { icon: ShieldCheck, label: "سائقون موثوقون" },
          { icon: Wallet, label: "أسعار واضحة" },
          { icon: Package, label: "نقل أمانات" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="rounded-xl border bg-card p-3 text-xs font-medium text-muted-foreground"
          >
            <Icon className="mx-auto mb-1.5 h-5 w-5 text-primary" />
            {label}
          </div>
        ))}
      </section>
    </AppShell>
  );
}
