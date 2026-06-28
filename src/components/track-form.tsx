"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TrackForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [ref, setRef] = React.useState(params.get("ref") ?? "");

  function submit() {
    const r = ref.trim();
    if (r) router.push(`/track?ref=${encodeURIComponent(r)}`);
  }

  return (
    <div className="flex gap-2">
      <Input
        value={ref}
        onChange={(e) => setRef(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="AMN-…  أو  PKG-…"
        aria-label="رقم الحجز أو الأمانة"
        className="nums"
      />
      <Button onClick={submit} className="shrink-0">
        <Search className="h-4 w-4" />
        تتبّع
      </Button>
    </div>
  );
}
