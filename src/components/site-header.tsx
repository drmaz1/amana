import Link from "next/link";
import { LogIn } from "lucide-react";

import { isDemoMode } from "@/lib/demo";
import { AmanaLogo } from "@/components/amana-logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const demo = isDemoMode();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="الصفحة الرئيسية">
          <AmanaLogo />
        </Link>

        <nav className="flex items-center gap-1">
          {demo && (
            <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-secondary-foreground">
              وضع العرض
            </span>
          )}
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/driver">للسائقين</Link>
          </Button>
          {!demo && (
            <Button asChild variant="outline" size="sm">
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                دخول
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
