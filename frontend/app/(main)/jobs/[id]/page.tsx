"use client";

import { useEffect, useState } from "react";
import { checkSavedItem, saveItem, unsaveItem } from "@/lib/api/content-api";
import DetailLoading from "@/components/details/DetailLoading";
import BharatLensDetail from "@/components/details/BharatLensDetail";
import { useJobById, useJobs } from "@/hooks/useApi";
import type { BharatLensJob } from "@/components/details/BharatLensDetail";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [paramId, setParamId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setParamId(id));
  }, [params]);

  const { data: job, error, isLoading } = useJobById(paramId ?? undefined);
  const { data: relatedResult } = useJobs({ limit: 3 });

  useEffect(() => {
    if (!paramId || error || !job) return;
    checkSavedItem(paramId, "job").then(setIsSaved).catch(() => {});
  }, [paramId, error, job]);

  if (isLoading || !paramId) {
    return <DetailLoading />;
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <p className="text-red-600 font-medium">
              {error instanceof Error ? error.message : "Job not found"}
            </p>
            <a
              href="/jobs"
              className="mt-4 inline-flex items-center rounded-xl bg-[#1A3C6E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3B82F6]"
            >
              Back to Jobs
            </a>
          </div>
        </div>
      </div>
    );
  }

  const relatedJobs = (relatedResult?.items ?? [])
    .filter((j) => j.id !== paramId)
    .slice(0, 3)
    .map((j) => ({
      id: j.id,
      title: j.title,
      subtitle: j.organization ?? j.category ?? "",
      href: `/jobs/${j.id}`,
    }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveItem(job.id, "job");
        setIsSaved(false);
      } else {
        await saveItem(job.id, "job");
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
      item={job as unknown as BharatLensJob}
      itemType="job"
      backHref="/jobs"
      backLabel="Back to Jobs"
      isSaved={isSaved}
      isSaving={isSaving}
      onToggleSave={handleSave}
      relatedItems={relatedJobs}
      relatedTitle="Other Jobs"
    />
  );
}
