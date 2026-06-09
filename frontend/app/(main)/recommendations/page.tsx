"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertCircle, Zap } from "lucide-react";
import SchemeCard from "@/components/cards/SchemeCard";
import ScholarshipCard from "@/components/cards/ScholarshipCard";
import JobCard from "@/components/cards/JobCard";
import ExamCard from "@/components/cards/ExamCard";
import CardSkeleton from "@/components/ui/skeletons/CardSkeleton";
import {
  saveItem,
  unsaveItem,
  type Recommendation,
  type Scheme,
  type Scholarship,
  type Job,
  type Exam,
} from "@/lib/api/content-api";
import { getCurrentUser } from "@/lib/api/auth-api";
import { useRecommendations, useSavedItemsMap } from "@/hooks/useApi";
import useSWR from "swr";

export default function RecommendationsPage() {
  const [page, setPage] = useState(1);
  const [savingMap, setSavingMap] = useState<Record<string, boolean>>({});

  const { data: result, error, isLoading } = useRecommendations({ page, limit: 12 });
  const { savedMap, mutate: mutateSaved } = useSavedItemsMap();
  const { data: profileIncomplete } = useSWR(
    "profile-status",
    async () => {
      try {
        const currentUser = await getCurrentUser();
        return currentUser.profile_completed !== true;
      } catch {
        return true;
      }
    },
    { dedupingInterval: 30000 },
  );

  const toggleSaved = async (itemId: string, itemType: string) => {
    setSavingMap((prev) => ({ ...prev, [itemId]: true }));
    try {
      const currentlySaved = Boolean(savedMap[itemId]);
      if (currentlySaved) {
        await unsaveItem(itemId, itemType as "scheme" | "scholarship" | "job" | "exam");
      } else {
        await saveItem(itemId, itemType as "scheme" | "scholarship" | "job" | "exam");
      }
      mutateSaved();
    } catch (error) {
      console.error("Save toggle failed:", error);
    } finally {
      setSavingMap((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const handleNextPage = () => {
    if (page < (result?.totalPages || 1)) {
      setPage((p) => p + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  };

  const recommendations = result?.items ?? [];

  const renderCard = (rec: Recommendation) => {
    const itemData = rec.item_data;
    const isSaved = savedMap[rec.item_id] || false;
    const isSaving = savingMap[rec.item_id] || false;
    const matchPercentage = Math.round((rec.match_score || 0) * 100);

    const handleToggleSaved = () => {
      toggleSaved(rec.item_id, rec.item_type);
    };

    switch (rec.item_type) {
      case "scheme":
        return (
          <div key={rec.id} className="relative">
            <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#3B82F6] px-2 py-1 text-xs font-semibold text-white">
              <Zap size={12} />{matchPercentage}% match
            </div>
            <SchemeCard scheme={itemData as Scheme} isSaved={isSaved} saving={isSaving} onToggleSaved={handleToggleSaved} />
          </div>
        );
      case "scholarship":
        return (
          <div key={rec.id} className="relative">
            <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#3B82F6] px-2 py-1 text-xs font-semibold text-white">
              <Zap size={12} />{matchPercentage}% match
            </div>
            <ScholarshipCard scholarship={itemData as Scholarship} isSaved={isSaved} saving={isSaving} onToggleSaved={handleToggleSaved} />
          </div>
        );
      case "job":
        return (
          <div key={rec.id} className="relative">
            <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#3B82F6] px-2 py-1 text-xs font-semibold text-white">
              <Zap size={12} />{matchPercentage}% match
            </div>
            <JobCard job={itemData as Job} isSaved={isSaved} saving={isSaving} onToggleSaved={handleToggleSaved} />
          </div>
        );
      case "exam":
        return (
          <div key={rec.id} className="relative">
            <div className="absolute top-3 right-3 z-10 inline-flex items-center gap-1 rounded-full bg-[#3B82F6] px-2 py-1 text-xs font-semibold text-white">
              <Zap size={12} />{matchPercentage}% match
            </div>
            <ExamCard exam={itemData as Exam} isSaved={isSaved} saving={isSaving} onToggleSaved={handleToggleSaved} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#3B82F6]">Personalized</p>
          <h1 className="mt-2 text-3xl font-bold text-[#1A3C6E] sm:text-4xl">AI Recommendations</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[#111827]/75">Opportunities tailored to your profile, eligibility, and preferences.</p>
        </div>

        {profileIncomplete === true && (
          <div className="mt-6 rounded-xl border border-[#FEF08A] bg-[#FFFACD] p-4 sm:p-5">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 flex-shrink-0 text-[#EAB308]" size={20} />
              <div className="flex-1">
                <h3 className="font-semibold text-[#111827]">Complete your profile for better recommendations</h3>
                <p className="mt-1 text-sm text-[#111827]/75">Add your details to get more accurate opportunities.</p>
                <Link href="/profile/setup" className="mt-3 inline-flex items-center rounded-lg bg-[#EAB308] px-4 py-2 text-sm font-semibold text-[#111827] transition hover:bg-[#D4A000]">Complete Profile</Link>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl border border-[#FECACA] bg-red-50 p-4 sm:p-5">
            <p className="text-sm text-red-700">{error instanceof Error ? error.message : "Failed to load recommendations"}</p>
          </div>
        )}

        {isLoading ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CardSkeleton key={i} lines={2} />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="mt-8 rounded-xl border border-[#E5E7EB] bg-white p-8 text-center">
            <p className="text-sm text-[#111827]/60">
              {profileIncomplete ? "Complete your profile to receive personalized recommendations" : "No recommendations available at this time. Check back later!"}
            </p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recommendations.map((rec) => renderCard(rec))}
            </div>

            {(result?.totalPages ?? 1) > 1 && (
              <div className="mt-8 flex items-center justify-between gap-4 rounded-xl border border-[#E5E7EB] bg-white p-4">
                <button onClick={handlePreviousPage} disabled={page === 1} className="rounded-lg bg-[#F9FAFB] px-4 py-2 text-sm font-semibold text-[#111827] transition disabled:opacity-50 hover:bg-[#E5E7EB]">Previous</button>
                <p className="text-sm text-[#111827]/60">Page {page} of {result?.totalPages ?? 1}</p>
                <button onClick={handleNextPage} disabled={page === (result?.totalPages ?? 1)} className="rounded-lg bg-[#F9FAFB] px-4 py-2 text-sm font-semibold text-[#111827] transition disabled:opacity-50 hover:bg-[#E5E7EB]">Next</button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
