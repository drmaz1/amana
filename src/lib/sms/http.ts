import type { SmsProvider } from "./types";

/**
 * Stub for a real Iraqi SMS gateway. Configure via env:
 *   SMS_HTTP_ENDPOINT  — POST URL of the gateway
 *   SMS_HTTP_API_KEY   — bearer token / API key
 *   SMS_HTTP_SENDER    — sender id (optional)
 *
 * The exact request shape varies by provider; adjust `buildRequest` when wiring
 * a specific gateway. Until then it throws if used without configuration.
 */
export class HttpSmsProvider implements SmsProvider {
  readonly name = "http";

  constructor(
    private readonly endpoint = process.env.SMS_HTTP_ENDPOINT,
    private readonly apiKey = process.env.SMS_HTTP_API_KEY,
    private readonly sender = process.env.SMS_HTTP_SENDER,
  ) {}

  async send(to: string, message: string): Promise<void> {
    if (!this.endpoint || !this.apiKey) {
      throw new Error(
        "HttpSmsProvider is not configured (set SMS_HTTP_ENDPOINT and SMS_HTTP_API_KEY).",
      );
    }
    const res = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({ to, message, from: this.sender }),
    });
    if (!res.ok) {
      throw new Error(`SMS gateway responded ${res.status}`);
    }
  }
}
