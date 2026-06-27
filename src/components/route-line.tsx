import { governorateName } from "@/lib/governorates";
import { cn } from "@/lib/utils";

/**
 * Signature element of Amana: the route line.
 * Shows origin → destination connected by a dashed travel line with city dots.
 * Reused on trip cards, trip details, confirmation, and parcel pages.
 */
export function RouteLine({
  originId,
  destinationId,
  middle,
  className,
  size = "md",
}: {
  originId: string;
  destinationId: string;
  /** Optional label rendered above the connector (e.g. duration). */
  middle?: React.ReactNode;
  className?: string;
  size?: "sm" | "md";
}) {
  const dot = size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3";
  const text = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* origin */}
      <div className="shrink-0 text-end">
        <div className={cn("font-display font-bold leading-tight", text)}>
          {governorateName(originId)}
        </div>
      </div>

      {/* connector */}
      <div className="relative flex flex-1 flex-col items-center">
        {middle && (
          <span className="mb-0.5 whitespace-nowrap rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground nums">
            {middle}
          </span>
        )}
        <div className="flex w-full items-center">
          <span className={cn("rounded-full bg-primary", dot)} />
          <span
            className="mx-1 h-px flex-1"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to left, hsl(var(--primary)) 0 5px, transparent 5px 11px)",
            }}
          />
          <span className={cn("rounded-full bg-accent ring-2 ring-accent/25", dot)} />
        </div>
      </div>

      {/* destination */}
      <div className="shrink-0 text-start">
        <div className={cn("font-display font-bold leading-tight", text)}>
          {governorateName(destinationId)}
        </div>
      </div>
    </div>
  );
}
