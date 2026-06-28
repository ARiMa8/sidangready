import type { ApiUser } from "@/lib/api";

const TOKEN_KEY = "sidangready_access_token";
const USER_KEY = "sidangready_user";

export const AUTH_COPY = {
  loginTitle: "Masuk ke SidangReady AI",
  registerTitle: "Buat akun beta",
  authActive:
    "Autentikasi sudah terhubung ke backend. Simpan token hanya di perangkat pribadi Anda.",
} as const;

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function storeAuthSession(token: string, user: ApiUser): void {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): ApiUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ApiUser;
  } catch {
    clearAuthSession();
    return null;
  }
}
