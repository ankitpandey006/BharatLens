import type { NotificationItem } from "@/types";

export const dummyNotifications: NotificationItem[] = [
  {
    id: "notification-1",
    title: "Deadline Reminder",
    message: "PM Kisan Samman Nidhi closes in 2 days. Complete your profile checks.",
    type: "Reminder",
    createdAt: "2026-05-27",
    read: false,
  },
  {
    id: "notification-2",
    title: "New Match Found",
    message: "You have a new scholarship match in the Technical category.",
    type: "Match",
    createdAt: "2026-05-26",
    read: false,
  },
  {
    id: "notification-3",
    title: "Exam Update",
    message: "SSC CGL application form correction window opened.",
    type: "Update",
    createdAt: "2026-05-24",
    read: true,
  },
  {
    id: "notification-4",
    title: "Saved Item Alert",
    message: "A saved job has moved to closing soon status.",
    type: "Saved Item",
    createdAt: "2026-05-23",
    read: true,
  },
];
