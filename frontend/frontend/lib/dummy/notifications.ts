import { recommendations } from "./recommendations";
import { users } from "./users";

export type NotificationType = "deadline_alert" | "recommendation_alert" | "new_scheme_alert" | "exam_update";
export type NotificationStatus = "active" | "closed";

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  related_entity_type: "scheme" | "scholarship" | "job" | "exam" | "recommendation";
  related_entity_id: string;
  status: NotificationStatus;
  read: boolean;
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";

export const notifications: Notification[] = users.flatMap((user, index) => {
  const rec = recommendations[index * 4];
  return [
    {
      id: `notif-${String(index + 1).padStart(2, "0")}-deadline`,
      user_id: user.id,
      title: "Deadline alert: application closes soon",
      message: "One of your matched opportunities closes in 3 days. Complete your application documents.",
      type: "deadline_alert",
      related_entity_type: rec.recommendation_type,
      related_entity_id: rec.entity_id,
      status: "active",
      read: index % 3 === 0,
      created_at: now,
      updated_at: now,
    },
    {
      id: `notif-${String(index + 1).padStart(2, "0")}-recommendation`,
      user_id: user.id,
      title: "New AI recommendation available",
      message: "BharatLens AI found a high-match listing based on your profile and latest preferences.",
      type: "recommendation_alert",
      related_entity_type: "recommendation",
      related_entity_id: rec.id,
      status: "active",
      read: false,
      created_at: now,
      updated_at: now,
    },
  ];
});

export const getUnreadNotifications = (userId: string): Notification[] =>
  notifications.filter((notification) => notification.user_id === userId && !notification.read && notification.status === "active");
