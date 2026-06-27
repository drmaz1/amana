/**
 * Iraqi phone-number helpers.
 *
 * Canonical storage form is E.164 (`+9647XXXXXXXXX`); the UI displays the local
 * form (`07XXXXXXXXX`). The national significant number (NSN) is always
 * `7XXXXXXXXX` — a leading `7` followed by 9 digits.
 *
 * Accepts messy input: Arabic-Indic digits, spaces/dashes/parens, and the
 * `+964` / `00964` / `964` / `0` prefixes.
 */

const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_ARABIC = "۰۱۲۳۴۵۶۷۸۹";

/** Convert Arabic-Indic / Eastern-Arabic digits to ASCII `0-9`. */
export function toWesternDigits(input: string): string {
  let out = "";
  for (const ch of input) {
    const ai = ARABIC_INDIC.indexOf(ch);
    if (ai !== -1) {
      out += String(ai);
      continue;
    }
    const ea = EASTERN_ARABIC.indexOf(ch);
    out += ea !== -1 ? String(ea) : ch;
  }
  return out;
}

/**
 * Reduce any accepted input to the 10-digit NSN (`7XXXXXXXXX`), or `null` if it
 * is not a valid Iraqi mobile number.
 */
function toNsn(input: string | null | undefined): string | null {
  if (!input) return null;
  let s = toWesternDigits(input).replace(/[\s\-().]/g, "");
  if (s.startsWith("+")) s = s.slice(1);
  if (s.startsWith("00")) s = s.slice(2);
  if (!/^\d+$/.test(s)) return null;

  if (s.startsWith("964")) s = s.slice(3); // country code
  else if (s.startsWith("0")) s = s.slice(1); // national trunk prefix

  return /^7\d{9}$/.test(s) ? s : null;
}

/** True when `input` is a valid Iraqi mobile number in any accepted form. */
export function isValidIraqiPhone(input: string | null | undefined): boolean {
  return toNsn(input) !== null;
}

/** Canonical E.164 (`+9647XXXXXXXXX`) for storage, or `null` if invalid. */
export function toE164(input: string | null | undefined): string | null {
  const nsn = toNsn(input);
  return nsn ? `+964${nsn}` : null;
}

/** Local display form (`07XXXXXXXXX`), or `null` if invalid. */
export function toLocalPhone(input: string | null | undefined): string | null {
  const nsn = toNsn(input);
  return nsn ? `0${nsn}` : null;
}

/** Both canonical forms at once, or `null` if invalid. */
export function normalizeIraqiPhone(
  input: string | null | undefined,
): { e164: string; local: string } | null {
  const nsn = toNsn(input);
  return nsn ? { e164: `+964${nsn}`, local: `0${nsn}` } : null;
}
