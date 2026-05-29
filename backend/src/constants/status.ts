export enum ContentStatus {
  Collected = "Collected",
  AIProcessed = "AI Processed",
  PendingVerification = "Pending Verification",
  AdminApproved = "Admin Approved",
  Published = "Published",
  Rejected = "Rejected",
}

export const PENDING_STATUS = ContentStatus.PendingVerification;
export const APPROVED_STATUS = ContentStatus.Published;
export const REJECTED_STATUS = ContentStatus.Rejected;
