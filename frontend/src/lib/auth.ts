export type StoredUser = {
  id: string;
  email: string;
  displayName: string;
};

const STORAGE_KEY = "fsd_user";
const SESSION_COOKIE = "fsd_session";

function setCookie(name: string, value: string, days = 30): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: StoredUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  setCookie(SESSION_COOKIE, user.id);
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  deleteCookie(SESSION_COOKIE);
}
