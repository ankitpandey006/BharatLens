"use client";

import { useEffect, useState } from "react";
import { checkSavedItem, saveItem, unsaveItem } from "@/lib/api/content-api";
import DetailLoading from "@/components/details/DetailLoading";
import BharatLensDetail from "@/components/details/BharatLensDetail";
import { useExamById, useExams } from "@/hooks/useApi";
import type { BharatLensExam } from "@/components/details/BharatLensDetail";

interface ExamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ExamDetailPage({ params }: ExamDetailPageProps) {
  const [paramId, setParamId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setParamId(id));
  }, [params]);

  const { data: exam, error, isLoading } = useExamById(paramId ?? undefined);
  const { data: relatedResult } = useExams(
    exam?.category ? { category: exam.category, limit: 3 } : undefined,
  );

  useEffect(() => {
    if (!paramId || error || !exam) return;
    checkSavedItem(paramId, "exam").then(setIsSaved).catch(() => {});
  }, [paramId, error, exam]);

  if (isLoading || !paramId) {
    return <DetailLoading />;
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-[#F5F3EE] px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
            <p className="text-red-600 font-medium">
              {error instanceof Error ? error.message : "Exam not found"}
            </p>
            <a
              href="/exams"
              className="mt-4 inline-flex items-center rounded-xl bg-[#1A3C6E] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3B82F6]"
            >
              Back to Exams
            </a>
          </div>
        </div>
      </div>
    );
  }

  const relatedExams = (relatedResult?.items ?? [])
    .filter((e) => e.id !== paramId)
    .slice(0, 3)
    .map((e) => ({
      id: e.id,
      title: e.title,
      subtitle: e.conductingBody ?? e.category ?? "",
      href: `/exams/${e.id}`,
    }));

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isSaved) {
        await unsaveItem(exam.id, "exam");
        setIsSaved(false);
      } else {
        await saveItem(exam.id, "exam");
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
      item={exam as unknown as BharatLensExam}
      itemType="exam"
      backHref="/exams"
      backLabel="Back to Exams"
      isSaved={isSaved}
      isSaving={isSaving}
      onToggleSave={handleSave}
      relatedItems={relatedExams}
      relatedTitle="Related Exams"
    />
  );
}
