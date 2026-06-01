import { supabase } from "../config/supabase";

export interface SourceItem {
  id: string;
  name: string;
  type: string;
  description: string;
  created_at: string;
}

export interface SourceRepository {
  getAll(): Promise<SourceItem[]>;
  getById(id: string): Promise<SourceItem | null>;
}

export async function getAllSources(): Promise<SourceItem[]> {
  const { data, error } = await supabase.from("sources").select("*").order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Supabase source read failed: ${error.message}`);
  }

  return (data as SourceItem[] | null) ?? [];
}

export async function getSourceById(id: string): Promise<SourceItem | null> {
  const { data, error } = await supabase.from("sources").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new Error(`Supabase source read failed: ${error.message}`);
  }

  return data as SourceItem | null;
}
