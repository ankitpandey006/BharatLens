"use client";

import { useEffect, useState } from "react";
import { checkSavedItem, saveItem, unsaveItem } from "@/lib/api/content-api";
import DetailLoading from "@/components/details/DetailLoading";
import BharatLensDetail from "@/components/details/BharatLensDetail";
import { useScholarshipById, useScholarships } from "@/hooks/useApi";
import type { BharatLensScholarship } from "@/components/details/BharatLensDetail";

interface ScholarshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ScholarshipDetailPage({ params }: ScholarshipDetailPageProps) {
  const [paramId, setParamId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setParamId(id));
  }, [params]);

  const { data: scholarship, error, isLoading } = useScholarshipById(paramId ?? undefined);
  const { data: relatedResult } = useScholarships(
    scholarship?.category ? { category: scholarship.category, limit: 3 } : undefined,
  );

  useEffect(() => {
    if (!paramId || error || !scholarship) return;
    checkSavedItem(paramId, "scholarship").then(setIsSaved).catch(() => {});
  }, [paramId, error, scholarship]);

  if (isLoading || !paramId) {
    return <DetailLoading />;
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <p className="text-red-600 font-medium">
              {error instanceof Error ? error.message : "Scholarship not found"}
            </p>
            <a
              href="/scholarships"
              className="mt-4 inline-flex items-center rounded-xl bg-[#1A3C6E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3B82F6]"
            >
              Back to Scholarships
            </a>
          </div>
        </div>
      </div>
    );
  }

  const relatedScholarships = (relatedResult?.items ?? [])
    .filter((s) => s.id !== paramId)
    .slice(0, 3)
    .map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.provider ?? s.category ?? "",
      href: `/scholarships/${s.id}`,
    }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveItem(scholarship.id, "scholarship");
        setIsSaved(false);
      } else {
        await saveItem(scholarship.id, "scholarship");
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Save action failed:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BharatLensDetail
      item={scholarship as unknown as BharatLensScholarship}
      itemType="scholarship"
      backHref="/scholarships"
      backLabel="Back to Scholarships"
      isSaved={isSaved}
      isSaving={isSaving}
      onToggleSave={handleSave}
      relatedItems={relatedScholarships}
      relatedTitle="Related Scholarships"
    />
  );
}
