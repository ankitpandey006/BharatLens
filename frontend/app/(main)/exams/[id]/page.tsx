"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Exam } from "@/lib/api/content-api";
import { checkSavedItem, fetchExamById, fetchExams, saveItem, unsaveItem } from "@/lib/api/content-api";
import DetailLoading from "@/components/details/DetailLoading";

interface ExamDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ExamDetailPage({ params }: ExamDetailPageProps) {
  const [paramId, setParamId] = useState<string | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [relatedExams, setRelatedExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    params.then(({ id }) => setParamId(id));
  }, [params]);

  useEffect(() => {
    if (!paramId) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch exam details
        const examData = await fetchExamById(paramId);
        setExam(examData);

        // Fetch related exams (same category)
        if (examData.category) {
          const related = await fetchExams({
            category: examData.category,
            limit: 3,
          });
          setRelatedExams(related.items.filter((e) => e.id !== paramId));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load exam details"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [paramId]);

  useEffect(() => {
    const loadSavedState = async () => {
      if (!paramId) return;
      try {
        const saved = await checkSavedItem(paramId, "exam");
        setIsSaved(saved);
      } catch (error) {
        console.error("Unable to check saved state:", error);
      }
    };

    loadSavedState();
  }, [paramId]);

  if (loading) {
    return <DetailLoading />;
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-600">
              {error || "Exam not found"}
            </p>
            <Link
              href="/exams"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Back to Exams
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!exam) return;
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Back Link */}
        <Link
          href="/exams"
          className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to Exams
        </Link>

        {/* Main Content */}
        <article className="rounded-2xl bg-white p-8 shadow-md">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{exam.title}</h1>
              <p className="mt-2 text-gray-600">{exam.conductingBody}</p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${
                isSaved
                  ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              } ${isSaving ? "cursor-wait opacity-70" : ""}`}
            >
              {isSaving ? "Saving..." : isSaved ? "✓ Saved" : "Save"}
            </button>
          </div>

          {/* Status Badge */}
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600">
              {exam.status || "Upcoming"}
            </span>
            {exam.category && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                {exam.category}
              </span>
            )}
          </div>

          {/* Key Details */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {exam.examDate && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Exam Date</h2>
                <p className="mt-1 text-lg text-gray-900">{exam.examDate}</p>
              </div>
            )}
            {exam.applicationDeadline && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Application Deadline</h2>
                <p className="mt-1 text-lg text-gray-900">{exam.applicationDeadline}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {exam.description && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900">About the Exam</h2>
              <p className="mt-4 leading-7 text-gray-700">{exam.description}</p>
            </div>
          )}

          {/* Eligibility */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-900">Eligibility</h2>
            <p className="mt-4 leading-7 text-gray-700">{exam.eligibility}</p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <button className="flex-1 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
              Register Now
            </button>
            <button className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">
              Share
            </button>
          </div>
        </article>

        {/* Related Exams */}
        {relatedExams.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">Related Exams</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedExams.map((related) => (
                <Link
                  key={related.id}
                  href={`/exams/${related.id}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-400 hover:shadow-md"
                >
                  <h3 className="font-semibold text-gray-900">{related.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{related.conductingBody}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
