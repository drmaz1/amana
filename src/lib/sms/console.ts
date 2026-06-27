import type { SmsProvider } from "./types";

/**
 * Development provider: prints the message to the server console instead of
 * sending a real SMS. This is where you read the OTP code while developing.
 */
export class ConsoleSmsProvider implements SmsProvider {
  readonly name = "console";

  async send(to: string, message: string): Promise<void> {
    console.log(
      `\n📱 [SMS:console] to ${to}\n   ${message}\n   (no real SMS sent — dev provider)\n`,
    );
  }
}
