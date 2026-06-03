
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

export async function listCollectedData(page: number, limit: number): Promise<{ items: CollectedDataRow[]; total: number }> {
  const offset = (page - 1) * limit;
  const { data, error, count } = await supabase
    .from("collected_data")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    throw new AppError(`Failed to list collected data: ${error.message}`, 500);
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
