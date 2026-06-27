"use client";

import * as React from "react";

/**
 * Last-resort boundary for errors thrown in the root layout itself.
 * It must render its own <html>/<body>. Kept minimal and dependency-free.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          margin: 0,
          background: "hsl(45 19% 96%)",
          color: "hsl(161 16% 12%)",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: "28rem" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 800 }}>
            حدث خطأ غير متوقع
          </h1>
          <p style={{ marginTop: "0.5rem", color: "hsl(161 8% 40%)" }}>
            تعذّر تحميل التطبيق. حاول إعادة المحاولة.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: "1.25rem",
              padding: "0.6rem 1.5rem",
              borderRadius: "0.5rem",
              border: "none",
              background: "hsl(171 79% 20%)",
              color: "hsl(45 33% 97%)",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            إعادة المحاولة
          </button>
        </div>
      </body>
    </html>
  );
}
