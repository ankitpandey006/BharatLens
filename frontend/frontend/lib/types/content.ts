import type { ListingStatus, NotificationType, SavedItemType } from "@/types";

export interface OpportunityRecord {
  id: string;
  title: string;
  category: string;
  provider: string;
  state?: string;
  location?: string;
  eligibility?: string;
  benefit?: string;
  deadline: string;
  officialLink?: string;
  status: ListingStatus;
  source: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SavedRecord {
  id: string;
  type: SavedItemType;
  title: string;
  provider: string;
  description: string;
  deadline: string;
  status: ListingStatus;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: string;
  read: boolean;
  source: string;
}
