"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Scholarship } from "@/lib/api/content-api";
import { checkSavedItem, fetchScholarshipById, fetchScholarships, saveItem, unsaveItem } from "@/lib/api/content-api";

interface ScholarshipDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ScholarshipDetailPage({ params }: ScholarshipDetailPageProps) {
  const [paramId, setParamId] = useState<string | null>(null);
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [relatedScholarships, setRelatedScholarships] = useState<Scholarship[]>([]);
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

        // Fetch scholarship details
        const scholarshipData = await fetchScholarshipById(paramId);
        setScholarship(scholarshipData);

        // Fetch related scholarships (same category)
        if (scholarshipData.category) {
          const related = await fetchScholarships({
            category: scholarshipData.category,
            limit: 3,
          });
          setRelatedScholarships(related.items.filter((s) => s.id !== paramId));
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load scholarship details"
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
        const saved = await checkSavedItem(paramId, "scholarship");
        setIsSaved(saved);
      } catch (error) {
        console.error("Unable to check saved state:", error);
      }
    };

    loadSavedState();
  }, [paramId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !scholarship) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-600">
              {error || "Scholarship not found"}
            </p>
            <Link
              href="/scholarships"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Back to Scholarships
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!scholarship) return;
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Back Link */}
        <Link
          href="/scholarships"
          className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to Scholarships
        </Link>

        {/* Main Content */}
        <article className="rounded-2xl bg-white p-8 shadow-md">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{scholarship.title}</h1>
              <p className="mt-2 text-gray-600">{scholarship.provider}</p>
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
              {scholarship.status || "Open"}
            </span>
            {scholarship.category && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                {scholarship.category}
              </span>
            )}
          </div>

          {/* Key Details */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {scholarship.amount && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Amount</h2>
                <p className="mt-1 text-lg text-gray-900">{scholarship.amount}</p>
              </div>
            )}
            {scholarship.deadline && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Deadline</h2>
                <p className="mt-1 text-lg text-gray-900">{scholarship.deadline}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {scholarship.description && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900">About</h2>
              <p className="mt-4 leading-7 text-gray-700">{scholarship.description}</p>
            </div>
          )}

          {/* Eligibility */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-900">Eligibility</h2>
            <p className="mt-4 leading-7 text-gray-700">{scholarship.eligibility}</p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            {scholarship.apply_url || scholarship.official_url || scholarship.source_url ? (
              <>
                {(scholarship.apply_url || scholarship.official_url) && (
                  <a
                    href={scholarship.apply_url || scholarship.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white hover:bg-blue-700"
                  >
                    Apply Now
                  </a>
                )}
                {scholarship.official_url && !scholarship.apply_url && (
                  <a
                    href={scholarship.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-green-600 px-6 py-3 text-center font-medium text-white hover:bg-green-700"
                  >
                    Official Website
                  </a>
                )}
                {scholarship.source_url && scholarship.source_url !== (scholarship.apply_url || scholarship.official_url) && (
                  <a
                    href={scholarship.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Source
                  </a>
                )}
              </>
            ) : (
              <button
                disabled
                className="flex-1 rounded-lg bg-gray-300 px-6 py-3 text-center font-medium text-gray-600 cursor-not-allowed"
              >
                Apply Link Not Available
              </button>
            )}
            <button className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">
              Share
            </button>
          </div>
        </article>

        {/* Related Scholarships */}
        {relatedScholarships.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">Related Scholarships</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedScholarships.map((related) => (
                <Link
                  key={related.id}
                  href={`/scholarships/${related.id}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-400 hover:shadow-md"
                >
                  <h3 className="font-semibold text-gray-900">{related.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{related.amount}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
