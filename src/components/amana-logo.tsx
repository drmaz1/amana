import { cn } from "@/lib/utils";

/** Brand mark: a rounded badge holding a small origin→destination route. */
export function AmanaMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      className={cn("h-9 w-9", className)}
      role="img"
      aria-label="أمانة"
    >
      <rect width="40" height="40" rx="11" fill="hsl(var(--primary))" />
      {/* origin dot (bottom-start) */}
      <circle cx="13" cy="28" r="3.2" fill="hsl(var(--accent))" />
      {/* dashed route */}
      <path
        d="M13 28 C 19 24, 21 16, 27 13"
        stroke="hsl(var(--primary-foreground))"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="0.1 5"
        fill="none"
      />
      {/* destination pin (top-end) */}
      <path
        d="M27 6.5c-3.2 0-5.8 2.5-5.8 5.7 0 4 5.8 9 5.8 9s5.8-5 5.8-9c0-3.2-2.6-5.7-5.8-5.7Z"
        fill="hsl(var(--primary-foreground))"
      />
      <circle cx="27" cy="12.2" r="2.1" fill="hsl(var(--primary))" />
    </svg>
  );
}

export function AmanaLogo({
  className,
  showTagline = false,
}: {
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <AmanaMark />
      <div className="leading-none">
        <span className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          أمانة
        </span>
        {showTagline && (
          <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
            سفر وأمانات بين المحافظات
          </span>
        )}
      </div>
    </div>
  );
}
