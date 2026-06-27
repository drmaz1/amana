import { governorate } from "@/lib/governorates";
import { AppShell } from "@/components/app-shell";
import { ParcelForm } from "@/components/parcel-form";

/** Use the query param only if it maps to a real governorate. */
function clean(id: string | undefined, fallback: string): string {
  if (!id) return fallback;
  return governorate(id).id === id ? id : fallback;
}

export default function ParcelRequestPage({
  searchParams,
}: {
  searchParams: { from?: string; to?: string };
}) {
  const from = clean(searchParams.from, "baghdad");
  const to = clean(searchParams.to, "basra");

  return (
    <AppShell>
      <ParcelForm defaultFrom={from} defaultTo={to === from ? "basra" : to} />
    </AppShell>
  );
}
