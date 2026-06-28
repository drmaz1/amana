import { BottomNav } from "@/components/bottom-nav";
import { SiteHeader } from "@/components/site-header";

/**
 * Chrome for real (server-rendered) pages: the auth-aware header + bottom nav.
 * The not-found/error/loading shells use `FallbackShell` instead so they never
 * pull the session helpers into a client bundle.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        تخطَّ إلى المحتوى
      </a>
      <SiteHeader />
      {/* pb-24 keeps content clear of the mobile bottom nav */}
      <main
        id="main-content"
        className="container flex-1 pb-24 pt-5 md:pb-10"
      >
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
