
export type CollectionMethod = "rss" | "scraping" | "pdf";
export type ProcessingStatus = "collected" | "processing" | "processed" | "failed";

export interface CollectedDataInsert {
  source_id: string;
  raw_title: string;
  raw_content: string;
  raw_url: string;
  collection_method: CollectionMethod;
  processing_status: ProcessingStatus;
  collected_at: string;
  title?: string;
  description?: string;
  category?: string;
  state?: string;
  deadline?: string;
  official_url?: string;
  item_type?: string;
  metadata?: Record<string, unknown>;
  admin_notes?: string;
}

export interface CollectorResult {
  source: string;
  fetched: number;
  inserted: number;
  duplicates: number;
  failed: number;
  skipped?: boolean;
  reason?: string;
}

export interface RssCollectorConfig {
  sourceName: string;
  defaultUrl?: string;
}

export interface ScraperResult extends CollectorResult {}

export interface PdfExtractResult extends CollectorResult {}

export interface CollectorStatus {
  source: string;
  sourceUrl: string;
  sourceType: string;
  isVerified: boolean;
  trustScore: number | null;
  lastCheckedAt: string | null;
}

export interface RunAllCollectorsResult {
  rss: Record<string, CollectorResult>;
  scraping: Record<string, ScraperResult>;
  pdf: {
    skipped: boolean;
    reason: string;
  };
  totalFetched: number;
  totalInserted: number;
  totalDuplicates: number;
  totalFailed: number;
}
