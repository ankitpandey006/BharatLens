"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Job } from "@/lib/api/content-api";
import { checkSavedItem, fetchJobById, fetchJobs, saveItem, unsaveItem } from "@/lib/api/content-api";
import DetailLoading from "@/components/details/DetailLoading";

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function JobDetailPage({ params }: JobDetailPageProps) {
  const [paramId, setParamId] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<Job[]>([]);
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

        // Fetch job details
        const jobData = await fetchJobById(paramId);
        setJob(jobData);

        // Fetch related jobs (same organization)
        const related = await fetchJobs({
          limit: 3,
        });
        setRelatedJobs(related.items.filter((j) => j.id !== paramId).slice(0, 3));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load job details"
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
        const saved = await checkSavedItem(paramId, "job");
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

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-600">
              {error || "Job not found"}
            </p>
            <Link
              href="/jobs"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
            >
              Back to Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!job) return;
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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Back Link */}
        <Link
          href="/jobs"
          className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          ← Back to Jobs
        </Link>

        {/* Main Content */}
        <article className="rounded-2xl bg-white p-8 shadow-md">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
              <p className="mt-2 text-gray-600">{job.organization}</p>
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
              {job.status || "Open"}
            </span>
            {job.category && (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                {job.category}
              </span>
            )}
          </div>

          {/* Key Details */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {job.location && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Location</h2>
                <p className="mt-1 text-lg text-gray-900">{job.location}</p>
              </div>
            )}
            {job.vacancies && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Vacancies</h2>
                <p className="mt-1 text-lg text-gray-900">{job.vacancies}</p>
              </div>
            )}
            {job.deadline && (
              <div>
                <h2 className="text-sm font-semibold text-gray-500 uppercase">Deadline</h2>
                <p className="mt-1 text-lg text-gray-900">{job.deadline}</p>
              </div>
            )}
          </div>

          {/* Description */}
          {job.description && (
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900">About the Job</h2>
              <p className="mt-4 leading-7 text-gray-700">{job.description}</p>
            </div>
          )}

          {/* Qualification */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-bold text-gray-900">Required Qualification</h2>
            <p className="mt-4 leading-7 text-gray-700">{job.qualification}</p>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            {job.apply_url || job.official_url || job.source_url ? (
              <>
                {(job.apply_url || job.official_url) && (
                  <a
                    href={job.apply_url || job.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white hover:bg-blue-700"
                  >
                    Apply Now
                  </a>
                )}
                {job.official_url && !job.apply_url && (
                  <a
                    href={job.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 rounded-lg bg-green-600 px-6 py-3 text-center font-medium text-white hover:bg-green-700"
                  >
                    Official Website
                  </a>
                )}
                {job.source_url && job.source_url !== (job.apply_url || job.official_url) && (
                  <a
                    href={job.source_url}
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

        {/* Related Jobs */}
        {relatedJobs.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">Other Jobs</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedJobs.map((related) => (
                <Link
                  key={related.id}
                  href={`/jobs/${related.id}`}
                  className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-400 hover:shadow-md"
                >
                  <h3 className="font-semibold text-gray-900">{related.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{related.organization}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
