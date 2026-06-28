"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { promoteUser } from "@/lib/actions/admin";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ROLE_LABEL: Record<string, string> = {
  PASSENGER: "راكب",
  DRIVER: "سائق",
  ADMIN: "مدير",
};

export function AdminRoleControl({
  userId,
  role,
  disabled,
}: {
  userId: string;
  role: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [val, setVal] = React.useState(role);
  const [busy, setBusy] = React.useState(false);

  async function change(next: string) {
    if (next === val || busy) return;
    const prev = val;
    setBusy(true);
    setVal(next);
    const res = await promoteUser(
      userId,
      next as Parameters<typeof promoteUser>[1],
    );
    setBusy(false);
    if (res.ok) {
      toast.success(`تم تغيير الدور إلى ${ROLE_LABEL[next]}`);
      router.refresh();
    } else {
      setVal(prev);
      toast.error(res.error);
    }
  }

  return (
    <Select value={val} onValueChange={change} disabled={busy || disabled}>
      <SelectTrigger className="h-8 w-[6.5rem] text-xs" aria-label="تغيير الدور">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(ROLE_LABEL).map(([v, label]) => (
          <SelectItem key={v} value={v} className="text-xs">
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
