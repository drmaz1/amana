import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format an amount in Iraqi Dinar, e.g. 25000 -> "٢٥٬٠٠٠ د.ع" */
export function formatIQD(amount: number): string {
  return new Intl.NumberFormat("ar-IQ", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " د.ع";
}

/** Format a date as Arabic weekday + day + month, e.g. "السبت ٢٧ حزيران" */
export function formatArabicDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-IQ", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
}

/** Format time only, e.g. "٠٧:٣٠ ص" */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ar-IQ", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Convert a duration in minutes to "٣ س ٤٥ د" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const fmt = new Intl.NumberFormat("ar-IQ");
  if (h && m) return `${fmt.format(h)} س ${fmt.format(m)} د`;
  if (h) return `${fmt.format(h)} س`;
  return `${fmt.format(m)} د`;
}
