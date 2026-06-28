import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

/** Read-only 5-star rating display. */
export function Stars({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      role="img"
      aria-label={`${value} من ٥`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            "h-4 w-4",
            i <= rounded
              ? "fill-accent text-accent"
              : "fill-transparent text-muted-foreground/30",
          )}
        />
      ))}
    </span>
  );
}
