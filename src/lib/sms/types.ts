/** Pluggable SMS sender. Swap implementations without touching call sites. */
export interface SmsProvider {
  readonly name: string;
  /** Deliver `message` to an E.164 phone number. Throws on failure. */
  send(to: string, message: string): Promise<void>;
}
