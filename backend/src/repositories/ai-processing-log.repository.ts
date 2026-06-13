/**
 * AI Processing Log Repository
 * Stores and retrieves logs for every AI processing run.
 */

import { supabase } from "../config/supabase";
import { AppError } from "../utils/app-error";

export interface AiProcessingLog {
  id?: string;
  collected_data_id: string;
  input_item?: Record<string, unknown> | null;
  ai_output?: Record<string, unknown> | null;
  confidence?: number | null;
  processing_time_ms?: number | null;
  error_message?: string | null;
  fallback_used?: boolean;
  status?: string;
  created_at?: string;
  // Pipeline tracking fields (optional — for pipeline logs)
  processing_type?: string;
  reason?: string;
  confidence_score?: number;
  source_name?: string;
  items_processed?: number;
  items_failed?: number;
  items_duplicate?: number;
}

export async function insertAiProcessingLog(record: AiProcessingLog): Promise<AiProcessingLog> {
  const { data, error } = await supabase
    .from("ai_processing_logs")
    .insert({
      collected_data_id: record.collected_data_id,
      input_item: record.input_item ?? null,
      ai_output: record.ai_output ?? null,
      confidence: record.confidence ?? null,
      processing_time_ms: record.processing_time_ms ?? null,
      error_message: record.error_message ?? null,
      fallback_used: record.fallback_used ?? false,
      status: record.status ?? "success",
    })
    .select()
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to insert AI processing log: ${error.message}`, 500);
  }

  return (data as AiProcessingLog) ?? record;
}

export async function getAiProcessingLogsByDataId(
  collectedDataId: string,
): Promise<AiProcessingLog[]> {
  const { data, error } = await supabase
    .from("ai_processing_logs")
    .select("*")
    .eq("collected_data_id", collectedDataId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(
      `Failed to fetch AI processing logs for ${collectedDataId}: ${error.message}`,
      500,
    );
  }

  return (data ?? []) as AiProcessingLog[];
}
