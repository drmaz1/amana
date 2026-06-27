import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";
import { AppShell } from "@/components/app-shell";
import { AmanaMark } from "@/components/amana-logo";
import { LoginForm } from "@/components/login-form";

export const metadata = { title: "تسجيل الدخول" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  // Only honor internal (same-site) redirect targets.
  const next =
    searchParams.next && searchParams.next.startsWith("/")
      ? searchParams.next
      : undefined;

  // Already signed in → go straight where they were headed.
  const session = await getSession();
  if (session) redirect(next || "/");

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

        <LoginForm next={next} />

        <p className="mt-4 text-center text-xs text-muted-foreground">
          أثناء التطوير، يظهر رمز التحقق في سجل الخادم (console) وفي الحقل أعلاه.
        </p>
      </div>
    </AppShell>
  );
}
