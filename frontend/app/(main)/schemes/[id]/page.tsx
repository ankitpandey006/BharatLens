"use client";

import { useEffect, useState } from "react";
import { checkSavedItem, saveItem, unsaveItem } from "@/lib/api/content-api";
import DetailLoading from "@/components/details/DetailLoading";
import BharatLensDetail from "@/components/details/BharatLensDetail";
import { useSchemeById, useSchemes } from "@/hooks/useApi";
import type { BharatLensScheme } from "@/components/details/BharatLensDetail";

interface SchemeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function SchemeDetailPage({ params }: SchemeDetailPageProps) {
  const [paramId, setParamId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setParamId(id));
  }, [params]);

  const { data: scheme, error, isLoading } = useSchemeById(paramId ?? undefined);
  const { data: relatedResult } = useSchemes(
    scheme?.category ? { category: scheme.category, limit: 3 } : undefined,
  );

  useEffect(() => {
    if (!paramId || error || !scheme) return;
    checkSavedItem(paramId, "scheme").then(setIsSaved).catch(() => {});
  }, [paramId, error, scheme]);

  if (isLoading || !paramId) {
    return <DetailLoading />;
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <p className="text-red-600 font-medium">
              {error instanceof Error ? error.message : "Scheme not found"}
            </p>
            <a
              href="/schemes"
              className="mt-4 inline-flex items-center rounded-xl bg-[#1A3C6E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3B82F6]"
            >
              Back to Schemes
            </a>
          </div>
        </div>
      </div>
    );
  }

  const relatedSchemes = (relatedResult?.items ?? [])
    .filter((s) => s.id !== paramId)
    .slice(0, 3)
    .map((s) => ({
      id: s.id,
      title: s.title,
      subtitle: s.provider ?? s.category ?? "",
      href: `/schemes/${s.id}`,
    }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveItem(scheme.id, "scheme");
        setIsSaved(false);
      } else {
        await saveItem(scheme.id, "scheme");
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
      item={scheme as unknown as BharatLensScheme}
      itemType="scheme"
      backHref="/schemes"
      backLabel="Back to Schemes"
      isSaved={isSaved}
      isSaving={isSaving}
      onToggleSave={handleSave}
      relatedItems={relatedSchemes}
      relatedTitle="Related Schemes"
    />
  );
}
