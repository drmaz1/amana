/**
 * Typed result for server actions. Actions never throw raw errors to the
 * client — they return `{ ok: false, error }` with a user-safe Arabic message
 * (and an optional machine `code` for the UI to branch on).
 */
export type ActionOk<T> = { ok: true } & T;
export type ActionError = { ok: false; error: string; code?: string };
export type ActionResult<T = Record<never, never>> = ActionOk<T> | ActionError;

export function actionError(error: string, code?: string): ActionError {
  return { ok: false, error, code };
}
