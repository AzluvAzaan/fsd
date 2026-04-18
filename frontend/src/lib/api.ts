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
  requestId: string; // non-empty when source === "request"
  createdAt: string;
};

export type CreateManualEventInput = {
  title: string;
  eventType: string;
  startTime: string;
  endTime: string;
  groupId?: string;
};

export type CalendarView = {
  userId: string;
  from: string;
  to: string;
  events: ApiEvent[];
};

export type ApiBusySlot = {
  userId: string;
  startTime: string;
  endTime: string;
};

export type ApiFreeSlot = {
  startTime: string;
  endTime: string;
};

export type GroupCalendarView = {
  groupId: string;
  userIds: string[];
  from: string;
  to: string;
  busySlots: ApiBusySlot[];
  freeSlots: ApiFreeSlot[];
};

export type GroupAvailabilityResponse = {
  freeSlots: ApiFreeSlot[];
};

export type ApiGroup = {
  id: string;
  name: string;
  inviteCode: string;
  createdById: string;
  createdAt: string;
};

export type ApiGroupMember = {
  id: string;
  groupId: string;
  userId: string;
  joinedAt: string;
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

export async function getGroupCalendar(
  groupId: string,
  userIds: string[],
  from?: string,
  to?: string,
): Promise<GroupCalendarView> {
  const params = new URLSearchParams();
  params.set("userIds", userIds.join(","));
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  return apiFetch<GroupCalendarView>(`/groups/${groupId}/calendar?${params.toString()}`);
}

export async function getGroupAvailability(
  groupId: string,
  from?: string,
  to?: string,
): Promise<GroupAvailabilityResponse> {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return apiFetch<GroupAvailabilityResponse>(`/groups/${groupId}/availability${query ? `?${query}` : ""}`);
}

export async function createManualEvent(input: CreateManualEventInput): Promise<ApiEvent> {
  return apiFetch<ApiEvent>("/events", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function deleteEvent(eventId: string): Promise<void> {
  return apiFetch<void>(`/events/${eventId}`, { method: "DELETE" });
}

// --- Groups ---

export async function getGroups(): Promise<ApiGroup[]> {
  return apiFetch<ApiGroup[]>("/groups");
}

export async function getGroupById(id: string): Promise<ApiGroup> {
  return apiFetch<ApiGroup>(`/groups/${id}`);
}

export async function getGroupMembers(groupId: string): Promise<ApiGroupMember[]> {
  return apiFetch<ApiGroupMember[]>(`/groups/${groupId}/members`);
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
  location: string;
  note: string;
  proposedStart: string;
  proposedEnd: string;
  status: string; // "pending" | "accepted" | "rejected"
  createdAt: string;
};

export type CreateEventRequestInput = {
  groupId: string;
  eventId?: string;
  title: string;
  eventType?: string;
  location?: string;
  note?: string;
  proposedStart: string;
  proposedEnd: string;
  recipientIds: string[];
};

export async function createEventRequest(
  input: CreateEventRequestInput,
): Promise<ApiEventRequest> {
  return apiFetch<ApiEventRequest>("/event-requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getEventRequestById(id: string): Promise<ApiEventRequest> {
  return apiFetch<ApiEventRequest>(`/event-requests/${id}`);
}

export async function getEventRequests(): Promise<ApiEventRequest[]> {
  return apiFetch<ApiEventRequest[]>("/event-requests/received");
}

export async function getSentEventRequests(): Promise<ApiEventRequest[]> {
  return apiFetch<ApiEventRequest[]>("/event-requests/sent");
}

export async function deleteEventRequest(requestId: string): Promise<void> {
  return apiFetch<void>(`/event-requests/${requestId}`, { method: "DELETE" });
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
