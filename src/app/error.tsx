"use client";

import * as React from "react";
import Link from "next/link";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";

import { FallbackShell } from "@/components/fallback-shell";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Surface the error to monitoring; never shown to the user.
    console.error(error);
  }, [error]);

  return (
    <FallbackShell>
      <div className="mx-auto max-w-md py-12 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="h-8 w-8" />
        </div>
        <h1 className="font-display text-2xl font-extrabold">
          حدث خطأ غير متوقع
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
          تعذّر إكمال العملية. يمكنك المحاولة مرة أخرى، وإن استمرّت المشكلة عُد
          إلى الصفحة الرئيسية.
        </p>
        <div className="mt-6 grid gap-2">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4" />
            حاول مرة أخرى
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="h-4 w-4" />
              العودة للرئيسية
            </Link>
          </Button>
        </div>
      </div>
    </FallbackShell>
  );
}
