"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Dark-mode switch. Persists to a non-httpOnly `theme` cookie (so the server
 * can render `<html class="dark">` with no flash) and toggles the class on the
 * document for an instant response. No localStorage — per the golden rules.
 */
export function ThemeToggle({ initialDark }: { initialDark: boolean }) {
  const [dark, setDark] = React.useState(initialDark);

  function apply(next: boolean) {
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    document.documentElement.style.colorScheme = next ? "dark" : "light";
    document.cookie = `theme=${next ? "dark" : "light"};path=/;max-age=${ONE_YEAR};samesite=lax`;
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      aria-label="الوضع الليلي"
      onClick={() => apply(!dark)}
      className="flex w-full items-center justify-between gap-2 rounded-lg px-1 py-1 text-start"
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        {dark ? (
          <Moon className="h-4 w-4 text-primary" />
        ) : (
          <Sun className="h-4 w-4 text-accent" />
        )}
        الوضع الليلي
      </span>
      <span
        aria-hidden="true"
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          dark ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform ${
            dark ? "-translate-x-5" : "-translate-x-0.5"
          }`}
        />
      </span>
    </button>
  );
}
