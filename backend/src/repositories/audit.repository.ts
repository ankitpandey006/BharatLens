import { supabase } from "../config/supabase";
import { AppError } from "../utils/app-error";

export interface AdminAuditRecord {
  id?: string;
  admin_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  previous_status?: string | null;
  new_status?: string | null;
  changed_fields?: Record<string, unknown> | null;
  reason?: string | null;
  created_at?: string;
}

export async function insertAdminAuditLog(record: AdminAuditRecord): Promise<AdminAuditRecord> {
  const { data, error } = await supabase.from("admin_audit_logs").insert(record).select().maybeSingle();

  if (error) {
    throw new AppError(`Failed to insert admin audit log: ${error.message}`, 500);
  }

  return (data as AdminAuditRecord) ?? record;
}
