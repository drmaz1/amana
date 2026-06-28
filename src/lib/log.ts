/**
 * Centralized server-side error logging for server actions. Produces a single
 * greppable line with a scope; full stack traces are only emitted outside
 * production. Errors are never returned to the client — actions surface a typed
 * `ActionResult` with a user-safe Arabic message instead.
 */
export function logError(scope: string, err: unknown): void {
  const detail =
    err instanceof Error ? `${err.name}: ${err.message}` : String(err);
  console.error(`[amana:error] ${scope} — ${detail}`);
  if (
    err instanceof Error &&
    err.stack &&
    process.env.NODE_ENV !== "production"
  ) {
    console.error(err.stack);
  }
}
