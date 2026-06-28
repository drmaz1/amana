import { Suspense } from "react";
import Link from "next/link";

import { isDemoMode } from "@/lib/demo";
import { AmanaLogo } from "@/components/amana-logo";
import { HeaderUserMenu } from "@/components/header-user-menu";
import { Button } from "@/components/ui/button";

/**
 * The auth-aware site header. Reads the session cookie (inside the isolated
 * `HeaderUserMenu`), so it's used only on real pages via `AppShell`; the
 * not-found/error/loading shells render `FallbackShell` instead.
 */
export function SiteHeader() {
  const demo = isDemoMode();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="الصفحة الرئيسية">
          <AmanaLogo />
        </Link>

        <nav className="flex items-center gap-2">
          {demo && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
              وضع العرض
            </span>
          )}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href="/driver">للسائقين</Link>
          </Button>
          <Suspense
            fallback={
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            }
          >
            <HeaderUserMenu />
          </Suspense>
        </nav>
      </div>
    </header>
  );
}
