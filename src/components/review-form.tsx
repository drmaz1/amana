"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";

import { createReview } from "@/lib/actions/review";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

/** Inline "rate the driver" form for a completed booking. */
export function ReviewForm({
  bookingId,
  driverName,
}: {
  bookingId: string;
  driverName: string;
}) {
  const router = useRouter();
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function submit() {
    if (rating < 1 || busy) return;
    setBusy(true);
    const res = await createReview(bookingId, {
      rating,
      comment: comment.trim() || undefined,
    });
    setBusy(false);
    if (res.ok) {
      toast.success("شكراً لتقييمك");
      setDone(true);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  if (done) {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
        تم تسجيل تقييمك. شكراً لك.
      </p>
    );
  }

  return (
    <div className="rounded-lg border bg-secondary/20 p-3">
      <div className="mb-2 text-xs font-medium text-muted-foreground">
        كيف كانت رحلتك مع {driverName}؟
      </div>
      <div className="flex items-center gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            aria-label={`${i} نجوم`}
            onClick={() => setRating(i)}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            className="rounded p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                i <= (hover || rating)
                  ? "fill-accent text-accent"
                  : "fill-transparent text-muted-foreground/40",
              )}
            />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="أضف تعليقاً (اختياري)"
        rows={2}
        maxLength={500}
        className="mt-2 text-sm"
      />
      <Button
        size="sm"
        className="mt-2"
        onClick={submit}
        disabled={rating < 1 || busy}
      >
        {busy ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            جارٍ الإرسال…
          </>
        ) : (
          "إرسال التقييم"
        )}
      </Button>
    </div>
  );
}
