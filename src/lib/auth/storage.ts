import type { AuthUser } from "./types";

const TOKEN_KEY = "ear_auth_token";
const USER_KEY = "ear_auth_user";
const AUTH_COOKIE = "ear_auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const AUTH_USER_EVENT = "ear-auth-user-change";

function notifyAuthUserChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(AUTH_USER_EVENT));
}

function setAuthCookie(token: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(token)}; path=/; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`;
}

function clearAuthCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; path=/; Max-Age=0; SameSite=Lax`;
}

/** Keep auth cookie in sync with localStorage (needed for middleware route guards). */
export function syncAuthCookie() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem(TOKEN_KEY)?.trim();
  if (token) {
    setAuthCookie(token);
  } else {
    clearAuthCookie();
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY)?.trim();
  return token || null;
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuth(token: string, user: AuthUser) {
  const trimmed = token.trim();
  localStorage.setItem(TOKEN_KEY, trimmed);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  setAuthCookie(trimmed);
  notifyAuthUserChanged();
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearAuthCookie();
  notifyAuthUserChanged();
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export { AUTH_COOKIE };
