import { AUTH_PORTAL_URL } from "./api";
const DRAFT_PREFIX = "scholardesk:request-draft:";
type DraftValue = string | number | boolean;

export function authUrl(mode: "login" | "register" = "login", returnPath?: string) {
  const destination = new URL(returnPath ?? window.location.href, window.location.origin);
  if (destination.origin !== window.location.origin) destination.href = window.location.origin;
  destination.searchParams.set("resume", "1");
  const url = new URL(mode === "register" ? "/register/customer" : "/", AUTH_PORTAL_URL);
  url.searchParams.set("return_to", destination.toString());
  return url.toString();
}
export function saveRequestDraft(key: string, values: Record<string, DraftValue>) { sessionStorage.setItem(`${DRAFT_PREFIX}${key}`, JSON.stringify(values)); }
export function readRequestDraft(key: string): Record<string, DraftValue> | null {
  const raw = sessionStorage.getItem(`${DRAFT_PREFIX}${key}`);
  if (!raw) return null;
  try { return JSON.parse(raw) as Record<string, DraftValue>; } catch { return null; }
}
export function clearRequestDraft(key: string) { sessionStorage.removeItem(`${DRAFT_PREFIX}${key}`); }