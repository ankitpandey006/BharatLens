import SavedItemCard from "@/components/cards/SavedItemCard";
import { getSavedItems } from "@/lib/services/content";

export default function SavedPage() {
  const dummySavedItems = getSavedItems();
  const savedCount = dummySavedItems.length;

  return (
    <section className="min-h-screen bg-[#F5F3EE] px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-md sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[#3B82F6]">BharatLens Library</p>
              <h1 className="mt-2 text-3xl font-bold text-[#1A3C6E] sm:text-4xl">Saved Items</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-[#111827]/75">
                Review your saved schemes, scholarships, jobs, and exams in one place.
              </p>
            </div>
            <span className="rounded-full bg-[#EEF2FF] px-4 py-2 text-sm font-semibold text-[#1A3C6E]">
              {savedCount} saved
            </span>
          </div>
        </div>

        {dummySavedItems.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center shadow-md">
            <p className="text-lg font-semibold text-[#1A3C6E]">No saved items yet</p>
            <p className="mt-1 text-sm text-[#111827]/70">Save listings from BharatLens to access them quickly here.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 xl:grid-cols-2">
            {dummySavedItems.map((item) => (
              <SavedItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
