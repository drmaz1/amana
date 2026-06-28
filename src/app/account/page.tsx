import Link from "next/link";
import { Phone, Settings, ShieldCheck, UserRound } from "lucide-react";

import { getUserProfile } from "@/lib/data";
import { isDemoMode } from "@/lib/demo";
import { toLocalPhone } from "@/lib/phone";
import { requireUser } from "@/lib/session";
import { formatArabicDate } from "@/lib/utils";
import { AppShell } from "@/components/app-shell";
import { ProfileForm } from "@/components/profile-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = { title: "الملف الشخصي" };

const ROLE_LABEL: Record<string, string> = {
  PASSENGER: "راكب",
  DRIVER: "سائق",
  ADMIN: "مدير",
};

export default async function AccountPage() {
  const session = await requireUser("/account");
  const profile = await getUserProfile(session.userId);
  const demo = isDemoMode();
  const localPhone = toLocalPhone(profile.phone);

  return (
    <AppShell>
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
            {profile.name.trim().charAt(0) || "؟"}
          </span>
          <div>
            <h1 className="font-display text-xl font-bold">
              {profile.name || "الملف الشخصي"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {ROLE_LABEL[profile.role] ?? "راكب"}
              {demo ? " · وضع العرض" : ""}
            </p>
          </div>
        </div>

        {/* Editable name */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <UserRound className="h-4 w-4 text-primary" />
              المعلومات الشخصية
            </div>
            <ProfileForm initialName={profile.name} demo={demo} />
          </CardContent>
        </Card>

        {/* Read-only account facts */}
        <Card className="mt-3">
          <CardContent className="grid gap-3 p-5">
            <InfoRow
              icon={<Phone className="h-4 w-4 text-muted-foreground" />}
              label="رقم الهاتف"
            >
              <span className="nums">{localPhone ?? "غير متوفر"}</span>
            </InfoRow>
            <div className="h-px bg-border" />
            <InfoRow
              icon={<ShieldCheck className="h-4 w-4 text-muted-foreground" />}
              label="نوع الحساب"
            >
              {ROLE_LABEL[profile.role] ?? "راكب"}
            </InfoRow>
            <div className="h-px bg-border" />
            <InfoRow
              icon={<UserRound className="h-4 w-4 text-muted-foreground" />}
              label="عضو منذ"
            >
              <span className="nums">{formatArabicDate(profile.createdAt)}</span>
            </InfoRow>
          </CardContent>
        </Card>

        <Button asChild variant="outline" className="mt-3 w-full">
          <Link href="/settings">
            <Settings className="h-4 w-4" />
            الإعدادات
          </Link>
        </Button>

        {!demo && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            رقم الهاتف هو هويتك لتسجيل الدخول ولا يمكن تغييره حالياً.
          </p>
        )}
      </div>
    </AppShell>
  );
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        {icon}
        {label}
      </span>
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
}
