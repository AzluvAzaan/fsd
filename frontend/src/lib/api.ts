import { env } from "@/lib/env";
import { getStoredUser } from "@/lib/auth";

export type ApiError = {
  error?: string;
};

export type User = {
  id: string;
  email: string;
  displayName?: string;
  gmailToken?: string;
  telegramChatId?: string;
  createdAt?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as ApiError;
      if (errorBody?.error) message = errorBody.error;
    } catch {
      // ignore json parse errors
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const userId = getStoredUser()?.id;
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "X-User-ID": userId } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  return parseResponse<T>(response);
}

export async function findUserByEmail(email: string) {
  const search = new URLSearchParams({ email });
  return apiFetch<User>(`/users?${search.toString()}`);
}

export async function getUserById(id: string) {
  return apiFetch<User>(`/users/${id}`);
}

export async function upsertUser(payload: User) {
  return apiFetch<User>("/users", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
