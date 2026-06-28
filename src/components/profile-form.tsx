"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save, UserRound } from "lucide-react";
import { toast } from "sonner";

import { updateProfile } from "@/lib/actions/profile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** Edit the signed-in user's display name. Mirrors the login-form pattern. */
export function ProfileForm({
  initialName,
  demo,
}: {
  initialName: string;
  demo: boolean;
}) {
  const router = useRouter();
  const [name, setName] = React.useState(initialName);
  const [busy, setBusy] = React.useState(false);

  const trimmed = name.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 60;
  const dirty = trimmed !== initialName.trim();

  async function save() {
    if (!valid || !dirty || busy) return;
    setBusy(true);
    const res = await updateProfile({ name: trimmed });
    setBusy(false);
    if (res.ok) {
      toast.success(
        demo ? "تم الحفظ (وضع العرض)" : "تم تحديث الاسم",
      );
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <div className="grid gap-3">
      <div className="grid gap-1.5">
        <Label htmlFor="name">الاسم</Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute end-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            type="text"
            placeholder="اسمك الكامل"
            className="ps-3 pe-10"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            maxLength={60}
            autoComplete="name"
          />
        </div>
      </div>
      <Button onClick={save} disabled={!valid || !dirty || busy}>
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جارٍ الحفظ…
          </>
        ) : (
          <>
            <Save className="h-4 w-4" />
            حفظ التغييرات
          </>
        )}
      </Button>
    </div>
  );
}
