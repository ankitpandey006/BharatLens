
import { supabase } from "../config/supabase";
import { AppError } from "../utils/app-error";
import type { CollectedDataInsert } from "../types/collector.types";

export interface SourceRow {
  id: string;
  source_name: string;
  source_url: string;
  source_type: string;
  is_verified: boolean;
  trust_score: number | null;
  last_checked_at: string | null;
}

export interface SourceStatusRow {
  source_name: string;
  source_url: string;
  source_type: string;
  is_verified: boolean;
  trust_score: number | null;
  last_checked_at: string | null;
}

export async function findSourceByName(sourceName: string): Promise<SourceRow | null> {
  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .eq("source_name", sourceName)
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to fetch source ${sourceName}: ${error.message}`, 500);
  }

  return data as SourceRow | null;
}

export interface CollectedDataRow {
  id: string;
  source_id: string;
  raw_title: string;
  raw_content: string;
  raw_url: string;
  collection_method: string;
  processing_status: string;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  state?: string | null;
  deadline?: string | null;
  official_url?: string | null;
  item_type?: string | null;
  metadata?: Record<string, unknown> | null;
  verification_status?: string | null;
  rejection_reason?: string | null;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_by?: string | null;
  rejected_at?: string | null;
  published_item_id?: string | null;
  published_by?: string | null;
  published_at?: string | null;
  unpublished_at?: string | null;
  is_deleted?: boolean | null;
  admin_notes?: string | null;
  collected_at: string;
  created_at: string;
  updated_at: string;
}

export async function existsByRawUrl(rawUrl: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("collected_data")
    .select("id")
    .eq("raw_url", rawUrl)
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to check duplicate URL: ${error.message}`, 500);
  }

  return Boolean(data);
}

export async function countCollectedData(): Promise<number> {
  const { count, error } = await supabase
    .from("collected_data")
    .select("id", { count: "exact", head: true });

  if (error) {
    throw new AppError(`Failed to count collected data: ${error.message}`, 500);
  }

  return count ?? 0;
}

export async function countCollectedDataByMethod(method: string): Promise<number> {
  const { count, error } = await supabase
    .from("collected_data")
    .select("id", { count: "exact", head: true })
    .eq("collection_method", method);

  if (error) {
    throw new AppError(`Failed to count collected data by method: ${error.message}`, 500);
  }

  return count ?? 0;
}

export async function listCollectedData(
  page: number,
  limit: number,
  verificationStatus?: string,
): Promise<{ items: CollectedDataRow[]; total: number }> {
  const offset = (page - 1) * limit;
  let query = supabase
    .from("collected_data")
    .select("*, sources:source_id(source_name, source_url)", { count: "exact" })
    .order("created_at", { ascending: false })
    .neq("is_deleted", true)
    .is("deleted_at", null);

  if (verificationStatus) {
    query = query.eq("verification_status", verificationStatus);
  }

  const { data, error, count } = await query.range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to list collected data: ${error?.message ?? "Unknown error"}`, 500);
  }

  return {
    items: (data as CollectedDataRow[] | null) ?? [],
    total: count ?? 0,
  };
}

export async function findCollectedUrls(rawUrls: string[]): Promise<string[]> {
  if (rawUrls.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("collected_data")
    .select("raw_url")
    .in("raw_url", rawUrls);

  if (error) {
    throw new AppError(`Failed to fetch collected URLs: ${error.message}`, 500);
  }

  return (data as Array<{ raw_url: string }> | null)?.map((item) => item.raw_url) ?? [];
}

export async function insertCollectedData(record: CollectedDataInsert): Promise<void> {
  const { error } = await supabase.from("collected_data").insert(record);

  if (error) {
    throw new AppError(`Failed to insert collected data: ${error.message}`, 500);
  }
}

export async function bulkInsertCollectedData(records: CollectedDataInsert[]): Promise<void> {
  if (records.length === 0) {
    return;
  }

  const { error } = await supabase.from("collected_data").insert(records);

  if (error) {
    throw new AppError(`Failed to insert collected data batch: ${error.message}`, 500);
  }
}

export async function updateSourceLastCheckedAt(sourceId: string): Promise<void> {
  const { error } = await supabase
    .from("sources")
    .update({ last_checked_at: new Date().toISOString() })
    .eq("id", sourceId);

  if (error) {
    throw new AppError(`Failed to update source last_checked_at: ${error.message}`, 500);
  }
}

export async function getCollectorStatuses(sourceNames: string[]): Promise<SourceStatusRow[]> {
  if (sourceNames.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("sources")
    .select("*")
    .in("source_name", sourceNames);

  if (error) {
    throw new AppError(`Failed to fetch collector statuses: ${error.message}`, 500);
  }

  return (data as SourceStatusRow[] | null) ?? [];
}

export async function getCollectedDataById(id: string): Promise<CollectedDataRow | null> {
  const { data, error } = await supabase
    .from("collected_data")
    .select("*, sources:source_id(source_name, source_url)")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to fetch collected data ${id}: ${error.message}`, 500);
  }

  return data as CollectedDataRow | null;
}

export async function updateCollectedDataById(id: string, updates: Record<string, unknown>): Promise<CollectedDataRow | null> {
  const { data, error } = await supabase
    .from("collected_data")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to update collected data ${id}: ${error.message}`, 500);
  }

  return data as CollectedDataRow | null;
}

export async function publishToTable(table: string, payload: Record<string, unknown>): Promise<any> {
  const { data, error } = await supabase.from(table).insert(payload).select().maybeSingle();

  if (error) {
    throw new AppError(`Failed to publish to ${table}: ${error.message}`, 500);
  }

  return data ?? null;
}
