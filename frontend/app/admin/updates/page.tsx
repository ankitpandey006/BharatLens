"use client";

import { useEffect, useState } from "react";
import { getAdminUpdates } from "@/lib/api/admin";

export default function UpdatesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUpdates() {
      try {
        const response = await getAdminUpdates();
        setUpdates(response || []);
      } catch (error) {
        console.error("Failed to load admin updates:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUpdates();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Content Updates</h1>
        <p className="mt-2 text-[#111827]/60">
          Review updates and content changes from the AI ingestion pipeline.
        </p>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
            Loading updates...
          </div>
        ) : updates.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center">
            <p className="text-lg font-semibold text-[#1A3C6E]">No updates found</p>
            <p className="mt-2 text-sm text-[#111827]/60">New content updates will appear here.</p>
          </div>
        ) : (
          updates.map((update) => (
            <div key={update.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
              <h2 className="font-semibold text-[#111827]">{update.title}</h2>
              <p className="mt-2 text-sm text-[#111827]/70">{update.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}