import Link from "next/link";
import { Compass, Home, Search } from "lucide-react";

import { FallbackShell } from "@/components/fallback-shell";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <FallbackShell>
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-extrabold">
          الصفحة غير موجودة
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          ربما تغيّر الرابط أو انتهت صلاحية الرحلة. لنرجعك إلى الطريق الصحيح.
        </p>
        <div className="mt-6 grid gap-2">
          <Button asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              العودة للرئيسية
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/search">
              <Search className="h-4 w-4" />
              ابحث عن رحلة
            </Link>
          </Button>
        </div>
      </div>
    </FallbackShell>
  );
}
