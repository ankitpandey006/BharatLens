"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkSavedItem, saveItem, unsaveItem } from "@/lib/api/content-api";
import DetailLoading from "@/components/details/DetailLoading";
import { useSchemeById, useSchemes } from "@/hooks/useApi";

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
      <div className="min-h-screen bg-gray-50 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-lg bg-red-50 p-6 text-center">
            <p className="text-red-600">{error instanceof Error ? error.message : "Scheme not found"}</p>
            <Link href="/schemes" className="mt-4 inline-block rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Back to Schemes</Link>
          </div>
        </div>
      </div>
    );
  }

  const relatedSchemes = (relatedResult?.items ?? []).filter((s) => s.id !== paramId).slice(0, 3);

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
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-4xl px-4">
        <Link href="/schemes" className="mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700">← Back to Schemes</Link>
        <article className="rounded-2xl bg-white p-8 shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div><h1 className="text-3xl font-bold text-gray-900">{scheme.title}</h1><p className="mt-2 text-gray-600">{scheme.category}</p></div>
            <button type="button" onClick={handleSave} disabled={isSaving}
              className={`rounded-lg px-4 py-2 font-medium transition-colors ${isSaved ? "bg-blue-100 text-blue-600 hover:bg-blue-200" : "bg-gray-100 text-gray-600 hover:bg-gray-200"} ${isSaving ? "cursor-wait opacity-70" : ""}`}>
              {isSaving ? "Saving..." : isSaved ? "✓ Saved" : "Save"}
            </button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-600">{scheme.status || "Active"}</span>
            {scheme.state && <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">{scheme.state}</span>}
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div><h2 className="text-sm font-semibold text-gray-500 uppercase">Provider</h2><p className="mt-1 text-lg text-gray-900">{scheme.provider}</p></div>
            <div><h2 className="text-sm font-semibold text-gray-500 uppercase">Benefit</h2><p className="mt-1 text-lg text-gray-900">{scheme.benefit}</p></div>
            {scheme.deadline && <div><h2 className="text-sm font-semibold text-gray-500 uppercase">Deadline</h2><p className="mt-1 text-lg text-gray-900">{scheme.deadline}</p></div>}
          </div>
          {scheme.description && <div className="mt-8 border-t border-gray-200 pt-8"><h2 className="text-xl font-bold text-gray-900">About</h2><p className="mt-4 leading-7 text-gray-700">{scheme.description}</p></div>}
          <div className="mt-8 border-t border-gray-200 pt-8"><h2 className="text-xl font-bold text-gray-900">Eligibility</h2><p className="mt-4 leading-7 text-gray-700">{scheme.eligibility}</p></div>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            {scheme.apply_url || scheme.official_url || scheme.source_url ? (
              <>
                {(scheme.apply_url || scheme.official_url) && (
                  <a href={scheme.apply_url || scheme.official_url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white hover:bg-blue-700">Apply Now</a>
                )}
                {scheme.official_url && !scheme.apply_url && (
                  <a href={scheme.official_url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg bg-green-600 px-6 py-3 text-center font-medium text-white hover:bg-green-700">Official Website</a>
                )}
                {scheme.source_url && scheme.source_url !== (scheme.apply_url || scheme.official_url) && (
                  <a href={scheme.source_url} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 hover:bg-gray-50">Source</a>
                )}
              </>
            ) : (
              <button disabled className="flex-1 rounded-lg bg-gray-300 px-6 py-3 text-center font-medium text-gray-600 cursor-not-allowed">Apply Link Not Available</button>
            )}
            <button className="flex-1 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50">Share</button>
          </div>
        </article>

        {relatedSchemes.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900">Related Schemes</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedSchemes.map((related) => (
                <Link key={related.id} href={`/schemes/${related.id}`} className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-400 hover:shadow-md">
                  <h3 className="font-semibold text-gray-900">{related.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{related.benefit}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
