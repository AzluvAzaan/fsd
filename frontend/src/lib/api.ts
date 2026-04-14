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

export type ApiEvent = {
  id: string;
  calendarId: string;
  title: string;
  type: string;
  startTime: string;
  endTime: string;
  status: string;
  source: string;
  createdAt: string;
};

export type CalendarView = {
  userId: string;
  from: string;
  to: string;
  events: ApiEvent[];
};

export type ApiGroup = {
  id: string;
  name: string;
  inviteCode: string;
  createdById: string;
  createdAt: string;
};

export type ApiNotification = {
  id: string;
  userId: string;
  requestId?: string;
  type: string;
  sentAt: string;
  channel: string;
};

export type SyncResult = {
  synced: number;
  provider: string;
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

// --- Calendar ---

export async function getCalendar(from?: string, to?: string): Promise<CalendarView> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return apiFetch<CalendarView>(`/calendar${query ? `?${query}` : ""}`);
}

// --- Groups ---

export async function getGroups(): Promise<ApiGroup[]> {
  return apiFetch<ApiGroup[]>("/groups");
}

export async function createGroup(name: string): Promise<ApiGroup> {
  return apiFetch<ApiGroup>("/groups", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function joinGroup(code: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/groups/join?code=${encodeURIComponent(code)}`, {
    method: "POST",
  });
}

// --- Notifications ---

export async function getNotifications(): Promise<ApiNotification[]> {
  return apiFetch<ApiNotification[]>("/notifications");
}

export async function markNotificationRead(notificationId: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/notifications/${notificationId}/read`, {
    method: "POST",
  });
}

// --- Event Requests ---

export type ApiEventRequest = {
  id: string;
  senderId: string;
  groupId: string;
  eventId: string;
  title: string;
  type: string;
  proposedStart: string;
  proposedEnd: string;
  status: string; // "pending" | "accepted" | "rejected"
  createdAt: string;
};

export async function getEventRequests(): Promise<ApiEventRequest[]> {
  return apiFetch<ApiEventRequest[]>("/event-requests/pending");
}

export async function respondToEventRequest(
  requestId: string,
  decision: "accepted" | "rejected",
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/event-requests/${requestId}/respond`, {
    method: "POST",
    body: JSON.stringify({ decision }),
  });
}

// --- Sync ---

export async function syncGoogleCalendar(): Promise<SyncResult> {
  return apiFetch<SyncResult>("/sync/google", { method: "POST" });
}
