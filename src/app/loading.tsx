import { FallbackShell } from "@/components/fallback-shell";

/** On-brand RTL skeleton shown while a route's data loads. */
export default function Loading() {
  return (
    <FallbackShell>
      <div className="animate-pulse" aria-hidden="true">
        {/* header line */}
        <div className="mb-5 flex items-center justify-between">
          <div className="h-6 w-40 rounded-lg bg-muted" />
          <div className="h-4 w-16 rounded bg-muted" />
        </div>
        {/* card skeletons */}
        <div className="grid gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="h-4 w-20 rounded bg-muted" />
                <div className="h-px flex-1 bg-border" />
                <div className="h-4 w-20 rounded bg-muted" />
              </div>
              <div className="my-3 h-px bg-border" />
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-32 rounded bg-muted" />
                  <div className="h-3 w-24 rounded bg-muted" />
                </div>
                <div className="h-6 w-20 rounded bg-muted" />
              </div>
              <div className="mt-4 h-10 w-full rounded-md bg-muted" />
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only">جارٍ التحميل…</span>
    </FallbackShell>
  );
}
