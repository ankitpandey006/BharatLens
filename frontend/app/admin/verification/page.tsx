"use client";

import { useEffect, useState } from "react";
import AdminItemTable from "@/components/admin/AdminItemTable";
import {
  fetchAdminItemsByStatus,
  type BackendAdminContentItem,
} from "@/lib/api/admin";

export default function VerificationPage() {
  const [items, setItems] = useState<BackendAdminContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAdminItemsByStatus("pending")
      .then(setItems)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">Data Verification</h1>
        <p className="mt-2 text-[#111827]/60">
          Review items awaiting verification from the backend.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <AdminItemTable items={items} isLoading={isLoading} />
      )}
    </div>
  );
}
