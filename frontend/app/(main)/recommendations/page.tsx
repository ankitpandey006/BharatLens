"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import * as recommendationsApi from "@/lib/api/recommendations";

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<recommendationsApi.Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch recommendations on mount
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        setError(null);
        const data = await recommendationsApi.getRecommendations();
        setRecommendations(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch recommendations");
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  // Handle generate recommendations
  const handleGenerateRecommendations = async () => {
    try {
      setGenerating(true);
      setError(null);
      const data = await recommendationsApi.generateRecommendations();
      setRecommendations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate recommendations");
    } finally {
      setGenerating(false);
    }
  };

  // Handle mark as viewed
  const handleMarkViewed = async (recommendationId: string) => {
    try {
      await recommendationsApi.markRecommendationViewed(recommendationId);
      setRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === recommendationId ? { ...rec, is_viewed: true } : rec
        )
      );
    } catch (err) {
      console.error("Failed to mark recommendation as viewed:", err);
    }
  };

  const getItemTypeBadgeColor = (itemType: string) => {
    switch (itemType) {
      case "scheme":
        return "bg-blue-100 text-blue-800";
      case "scholarship":
        return "bg-purple-100 text-purple-800";
      case "job":
        return "bg-green-100 text-green-800";
      case "exam":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getItemTypeUrl = (itemType: string, itemId: string) => {
    switch (itemType) {
      case "scheme":
        return `/schemes/${itemId}`;
      case "scholarship":
        return `/scholarships/${itemId}`;
      case "job":
        return `/jobs/${itemId}`;
      case "exam":
        return `/exams/${itemId}`;
      default:
        return "/";
    }
  };

  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#1A3C6E]" size={24} />
                <h1 className="text-3xl font-bold text-[#1A3C6E] sm:text-4xl">AI Recommendations</h1>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#111827]/75">
                Personalized opportunities matched to your profile based on AI analysis.
              </p>
            </div>
            <button
              onClick={handleGenerateRecommendations}
              disabled={generating || loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#1A3C6E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F2A52] disabled:bg-gray-400"
            >
              <RefreshCw size={16} className={generating ? "animate-spin" : ""} />
              {generating ? "Generating..." : "Generate/Refresh"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <div className="flex justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#E5E7EB] border-t-[#1A3C6E]"></div>
            </div>
            <p className="mt-4 text-lg font-semibold text-[#1A3C6E]">Loading recommendations...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="mt-8 rounded-2xl border-2 border-red-200 bg-red-50 p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={24} />
              <div>
                <h3 className="font-semibold text-red-900">Error loading recommendations</h3>
                <p className="mt-1 text-sm text-red-800">{error}</p>
              </div>
            </div>
            <button
              onClick={handleGenerateRecommendations}
              className="mt-4 inline-flex rounded-full border-2 border-red-600 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && recommendations.length === 0 && (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">No recommendations yet</p>
            <p className="mt-2 text-sm text-[#111827]/70">
              Complete your profile to get personalized opportunities matched to your goals.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/profile/setup"
                className="inline-flex rounded-full bg-[#1A3C6E] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0F2A52]"
              >
                Complete Profile
              </Link>
              <button
                onClick={handleGenerateRecommendations}
                className="inline-flex rounded-full border-2 border-[#1A3C6E] px-4 py-2 text-sm font-semibold text-[#1A3C6E] transition hover:bg-[#F5F3EE]"
              >
                Generate Recommendations
              </button>
            </div>
          </div>
        )}

        {/* Recommendations List */}
        {!loading && !error && recommendations.length > 0 && (
          <div className="mt-8 space-y-4">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                href={getItemTypeUrl(rec.item_type, rec.item_id)}
                onClick={() => handleMarkViewed(rec.id)}
                className={`block rounded-2xl border border-[#E5E7EB] p-5 transition hover:border-[#9BB6E5] hover:shadow-lg ${
                  rec.is_viewed ? "bg-[#F9FAFB]" : "bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Item Type Badge and Score */}
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getItemTypeBadgeColor(rec.item_type)}`}>
                        {rec.item_type.charAt(0).toUpperCase() + rec.item_type.slice(1)}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
                        {Math.round(rec.score)}% Match
                      </span>
                      {rec.is_viewed && (
                        <span className="text-xs font-medium text-[#111827]/50">Viewed</span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className={`text-lg font-semibold ${rec.is_viewed ? "text-[#111827]/60" : "text-[#1A3C6E]"}`}>
                      {rec.title}
                    </h3>

                    {/* Reason */}
                    <p className="mt-2 text-sm leading-6 text-[#111827]/70">{rec.reason}</p>

                    {/* Description (if available) */}
                    {rec.description && (
                      <p className="mt-3 line-clamp-2 text-sm text-[#111827]/60">{rec.description}</p>
                    )}

                    {/* Timestamp */}
                    {rec.created_at && (
                      <p className="mt-3 text-xs text-[#111827]/50">
                        Recommended on {new Date(rec.created_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Arrow Icon */}
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F3EE] text-[#1A3C6E]">
                    →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
