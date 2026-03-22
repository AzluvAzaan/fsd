import {
  availabilitySlots,
  groups,
  integrations,
  notifications,
  personalEvents,
  requests,
  todayAgenda,
} from "@/lib/constants/mock-data";

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getMockCalendarData() {
  await delay();
  return { personalEvents, todayAgenda };
}

export async function getMockGroups() {
  await delay();
  return groups;
}

export async function getMockGroupById(groupId: string) {
  await delay();
  return groups.find((group) => group.id === groupId) ?? groups[0];
}

export async function getMockAvailability() {
  await delay();
  return availabilitySlots;
}

export async function getMockRequests() {
  await delay();
  return requests;
}

export async function getMockNotifications() {
  await delay();
  return notifications;
}

export async function getMockIntegrations() {
  await delay();
  return integrations;
}
