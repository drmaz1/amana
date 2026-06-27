import { randomInt } from "node:crypto";

// Unambiguous base32 alphabet (no 0/O/1/I) for human-friendly, read-aloud refs.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * A short, human-friendly reference such as `AMN-7K2QF9` (bookings) or
 * `PKG-9X  ...` (parcels). Server-only (uses node:crypto); never import from a
 * client component.
 */
export function generateReference(prefix: string, length = 6): string {
  let body = "";
  for (let i = 0; i < length; i++) {
    body += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `${prefix}-${body}`;
}
