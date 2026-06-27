import { ConsoleSmsProvider } from "./console";
import { HttpSmsProvider } from "./http";
import type { SmsProvider } from "./types";

export type { SmsProvider } from "./types";
export { ConsoleSmsProvider } from "./console";
export { HttpSmsProvider } from "./http";

let provider: SmsProvider | null = null;

/**
 * The active SMS provider. Uses the HTTP gateway when `SMS_PROVIDER=http`,
 * otherwise the console provider (dev default — the OTP prints to the server log).
 */
export function getSmsProvider(): SmsProvider {
  if (provider) return provider;
  provider =
    process.env.SMS_PROVIDER === "http"
      ? new HttpSmsProvider()
      : new ConsoleSmsProvider();
  return provider;
}
