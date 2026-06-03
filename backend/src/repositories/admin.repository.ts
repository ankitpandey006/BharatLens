import { supabase } from "../config/supabase";
import { AppError } from "../utils/app-error";

export type AdminItemType = "scheme" | "scholarship" | "job" | "exam";

export interface AdminItem {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  verification_status?: string;
  rejection_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  published_by?: string | null;
  published_at?: string | null;
  expired_by?: string | null;
  expired_at?: string | null;
  is_expired?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface AdminItemUpdates {
  status?: string;
  verification_status?: string;
  rejection_reason?: string;
  is_expired?: boolean;
  [key: string]: unknown;
}

export interface AdminStats {
  total_users: number;
  total_schemes: number;
  total_scholarships: number;
  total_jobs: number;
  total_exams: number;
  pending_items: number;
  approved_items: number;
  rejected_items: number;
  total_saved_items: number;
  total_notifications: number;
}

export interface AdminSource {
  id: string;
  [key: string]: unknown;
}

export interface AdminUpdate {
  id: string;
  [key: string]: unknown;
}

const tableNames: Record<AdminItemType, string> = {
  scheme: "schemes",
  scholarship: "scholarships",
  job: "jobs",
  exam: "exams",
};

function getTableName(itemType: AdminItemType): string {
  return tableNames[itemType];
}

async function performUpdate(
  itemType: AdminItemType,
  itemId: string,
  updates: Partial<AdminItem>,
): Promise<AdminItem | null> {
  const table = getTableName(itemType);
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq("id", itemId)
    .select()
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to update ${itemType} item: ${error.message}`, 500);
  }

  return data as AdminItem | null;
}

async function fetchFromTable(itemType: AdminItemType, verificationStatus: string): Promise<AdminItem[]> {
  const table = getTableName(itemType);
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("verification_status", verificationStatus);

  if (error) {
    throw new AppError(`Failed to fetch ${itemType} items: ${error.message}`, 500);
  }

  return ((data ?? []) as AdminItem[]).map((item) => ({ ...item, item_type: itemType }));
}

export async function fetchAdminItemsByVerificationStatus(
  status: string,
  itemType?: AdminItemType,
): Promise<AdminItem[]> {
  if (itemType) {
    return fetchFromTable(itemType, status);
  }

  const [schemes, scholarships, jobs, exams] = await Promise.all([
    fetchFromTable("scheme", status),
    fetchFromTable("scholarship", status),
    fetchFromTable("job", status),
    fetchFromTable("exam", status),
  ]);

  return [...schemes, ...scholarships, ...jobs, ...exams];
}

export async function getAdminContentById(itemType: AdminItemType, itemId: string): Promise<AdminItem | null> {
  const table = getTableName(itemType);
  const { data, error } = await supabase.from(table).select("*").eq("id", itemId).maybeSingle();

  if (error) {
    throw new AppError(`Failed to fetch ${itemType} item: ${error.message}`, 500);
  }

  return data as AdminItem | null;
}

export async function approveAdminContentById(itemType: AdminItemType, itemId: string, adminId: string): Promise<AdminItem | null> {
  return performUpdate(itemType, itemId, {
    verification_status: "approved",
    approved_by: adminId,
    approved_at: new Date().toISOString(),
  });
}

export async function rejectAdminContentById(
  itemType: AdminItemType,
  itemId: string,
  adminId: string,
  rejectionReason?: string,
): Promise<AdminItem | null> {
  void adminId;
  return performUpdate(itemType, itemId, {
    verification_status: "rejected",
    rejection_reason: rejectionReason ?? null,
  });
}

export async function publishAdminContentById(itemType: AdminItemType, itemId: string, adminId: string): Promise<AdminItem | null> {
  void adminId;
  return performUpdate(itemType, itemId, {
    verification_status: "published",
  });
}

export async function unpublishAdminContentById(itemType: AdminItemType, itemId: string, adminId: string): Promise<AdminItem | null> {
  void adminId;
  return performUpdate(itemType, itemId, {
    verification_status: "pending",
  });
}

export async function expireAdminContentById(itemType: AdminItemType, itemId: string, adminId: string): Promise<AdminItem | null> {
  return performUpdate(itemType, itemId, {
    verification_status: "expired",
    is_expired: true,
    expired_by: adminId,
    expired_at: new Date().toISOString(),
  });
}

export async function updateAdminContentById(
  itemType: AdminItemType,
  itemId: string,
  updates: AdminItemUpdates,
): Promise<AdminItem | null> {
  return performUpdate(itemType, itemId, updates);
}

export async function deleteAdminContentById(itemType: AdminItemType, itemId: string): Promise<boolean> {
  const table = getTableName(itemType);
  const { data, error } = await supabase.from(table).delete().eq("id", itemId).select("id").maybeSingle();

  if (error) {
    throw new AppError(`Failed to delete ${itemType} item: ${error.message}`, 500);
  }

  return Boolean(data);
}

export async function fetchAdminUsers() {
  const { data, error } = await supabase.from("users").select("id, email, full_name, role, created_at");
  if (error) {
    throw new AppError(`Failed to fetch admin users: ${error.message}`, 500);
  }
  return data ?? [];
}

export async function insertAdminAction(action: {
  admin_id: string;
  item_id: string;
  item_type: AdminItemType;
  action: string;
  detail?: string | null;
}): Promise<void> {
  const { error } = await supabase.from("admin_actions").insert(action);
  if (error) {
    throw new AppError(`Failed to record admin action: ${error.message}`, 500);
  }
}

async function countRows(table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select("id", { count: "exact" });

  if (error) {
    throw new AppError(`Failed to count ${table}: ${error.message}`, 500);
  }

  return count ?? 0;
}

async function countContentByVerificationStatus(status: string): Promise<number> {
  const counts = await Promise.all(
    (Object.keys(tableNames) as AdminItemType[]).map(async (itemType) => {
      const table = getTableName(itemType);
      const { count, error } = await supabase
        .from(table)
        .select("id", { count: "exact" })
        .eq("verification_status", status);

      if (error) {
        throw new AppError(`Failed to count ${itemType} ${status} items: ${error.message}`, 500);
      }

      return count ?? 0;
    }),
  );

  return counts.reduce((total, count) => total + count, 0);
}

export async function fetchAdminStatsSummary(): Promise<AdminStats> {
  const [
    totalUsers,
    totalSchemes,
    totalScholarships,
    totalJobs,
    totalExams,
    pendingItems,
    approvedItems,
    rejectedItems,
    totalSavedItems,
    totalNotifications,
  ] = await Promise.all([
    countRows("users"),
    countRows("schemes"),
    countRows("scholarships"),
    countRows("jobs"),
    countRows("exams"),
    countContentByVerificationStatus("pending"),
    countContentByVerificationStatus("approved"),
    countContentByVerificationStatus("rejected"),
    countRows("saved_items"),
    countRows("notifications"),
  ]);

  return {
    total_users: totalUsers,
    total_schemes: totalSchemes,
    total_scholarships: totalScholarships,
    total_jobs: totalJobs,
    total_exams: totalExams,
    pending_items: pendingItems,
    approved_items: approvedItems,
    rejected_items: rejectedItems,
    total_saved_items: totalSavedItems,
    total_notifications: totalNotifications,
  };
}

export async function fetchAdminSources(): Promise<AdminSource[]> {
  const { data, error } = await supabase.from("sources").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new AppError(`Failed to fetch sources: ${error.message}`, 500);
  }

  return (data ?? []) as AdminSource[];
}

export async function verifyAdminSource(sourceId: string, adminId: string): Promise<AdminSource | null> {
  const { data, error } = await supabase
    .from("sources")
    .update({ is_verified: true, verified_by: adminId, verified_at: new Date().toISOString() })
    .eq("id", sourceId)
    .select()
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to verify source: ${error.message}`, 500);
  }

  return data as AdminSource | null;
}

export async function fetchAdminUpdates(): Promise<AdminUpdate[]> {
  const { data, error } = await supabase.from("content_updates").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new AppError(`Failed to fetch updates: ${error.message}`, 500);
  }

  return (data ?? []) as AdminUpdate[];
}

export async function updateUserRole(userId: string, newRole: string, adminId: string) {
  const { data, error } = await supabase
    .from("users")
    .update({ role: newRole, updated_by: adminId, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to update user role: ${error.message}`, 500);
  }

  return data as unknown;
}
