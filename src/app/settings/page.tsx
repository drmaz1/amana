import { cookies } from "next/headers";
import Link from "next/link";
import { ChevronLeft, Globe, LogOut, Moon, UserRound } from "lucide-react";

import { logout } from "@/lib/actions/auth";
import { isDemoMode } from "@/lib/demo";
import { requireUser } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { ThemeToggle } from "@/components/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "الإعدادات" };

export default async function SettingsPage() {
  await requireUser("/settings");
  const demo = isDemoMode();
  // Page is already dynamic (session read) so a server cookie read is free here.
  const initialDark = cookies().get("theme")?.value === "dark";

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <div className="mb-5">
          <h1 className="font-display text-xl font-bold">الإعدادات</h1>
          <p className="text-sm text-muted-foreground">
            خصّص تجربتك في أمانة.
          </p>
        </div>

        {/* Account */}
        <SectionLabel>الحساب</SectionLabel>
        <Card>
          <CardContent className="p-2">
            <Link
              href="/account"
              className="flex items-center justify-between gap-2 rounded-lg px-3 py-3 transition-colors hover:bg-secondary"
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <UserRound className="h-4 w-4 text-primary" />
                الملف الشخصي
              </span>
              <ChevronLeft className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>

        {/* Appearance */}
        <SectionLabel>المظهر</SectionLabel>
        <Card>
          <CardContent className="grid gap-1 p-3">
            <ThemeToggle initialDark={initialDark} />
            <div className="h-px bg-border" />
            <div className="flex items-center justify-between gap-2 px-1 py-2">
              <span className="flex items-center gap-2 text-sm font-medium">
                <Globe className="h-4 w-4 text-primary" />
                اللغة
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                العربية
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] text-secondary-foreground">
                  المزيد قريباً
                </span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Session */}
        {!demo && (
          <>
            <SectionLabel>الجلسة</SectionLabel>
            <Card>
              <CardContent className="p-2">
                <form action={logout}>
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-3 text-start text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                  >
                    <LogOut className="h-4 w-4" />
                    تسجيل الخروج
                  </button>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <Moon className="h-3.5 w-3.5" />
          أمانة · الإصدار <span className="nums">0.1.0</span>
        </p>
      </div>
    </AppShell>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-5 px-1 text-xs font-semibold text-muted-foreground">
      {children}
    </div>
  );
}
