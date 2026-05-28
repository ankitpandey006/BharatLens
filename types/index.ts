export * from "./common";
export * from "./user";
export * from "./scheme";
export * from "./scholarship";
export * from "./job";
export * from "./exam";

export type ListingStatus = "Open" | "Closing Soon" | "Closed" | "Upcoming";

export interface SchemeListItem {
  id: string;
  title: string;
  ministry: string;
  provider: string;
  category: string;
  benefit: string;
  eligibility: string;
  deadline: string;
  status: ListingStatus;
  description: string;
}

export interface ScholarshipListItem {
  id: string;
  title: string;
  provider: string;
  category: string;
  eligibility: string;
  amount: string;
  deadline: string;
  status: ListingStatus;
  description: string;
}

export interface JobListItem {
  id: string;
  title: string;
  organization: string;
  location: string;
  qualification: string;
  vacancies: number;
  deadline: string;
  status: ListingStatus;
  description: string;
}

export interface ExamListItem {
  id: string;
  title: string;
  conductingBody: string;
  category: string;
  examDate: string;
  applicationDeadline: string;
  status: ListingStatus;
  description: string;
}

export type SavedItemType = "Scheme" | "Scholarship" | "Job" | "Exam";

export interface SavedItem {
  id: string;
  type: SavedItemType;
  title: string;
  provider: string;
  description: string;
  deadline: string;
  status: ListingStatus;
}

export type NotificationType = "Reminder" | "Match" | "Update" | "Saved Item";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
}
