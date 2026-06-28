import Link from "next/link";

import { AmanaLogo } from "@/components/amana-logo";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";

/**
 * Minimal app chrome for the not-found / error / loading shells. Deliberately
 * does NOT import the auth-aware SiteHeader: that would pull `next/headers`
 * (via the session helpers) into the `error.tsx` client bundle and would risk
 * making `/_not-found` render dynamically. Logo + a static link only — no
 * session read.
 */
export function FallbackShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" aria-label="الصفحة الرئيسية">
            <AmanaLogo />
          </Link>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Link href="/driver">للسائقين</Link>
          </Button>
        </div>
      </header>
      <main className="container flex-1 pb-24 pt-5 md:pb-10">{children}</main>
      <BottomNav />
    </div>
  );
}
