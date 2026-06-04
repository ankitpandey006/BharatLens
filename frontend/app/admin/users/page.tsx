"use client";

import { useEffect, useState } from "react";
import type { BackendAdminUser } from "@/lib/api/admin";
import { fetchAdminUsers } from "@/lib/api/admin";

export default function UsersPage() {
  const [users, setUsers] = useState<BackendAdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAdminUsers()
      .then(setUsers)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#1A3C6E]">User Management</h1>
        <p className="mt-2 text-[#111827]/60">
          Monitor and manage BharatLens user accounts.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-6 text-sm text-red-700">
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-[#F5F3EE] text-left text-sm font-semibold text-[#1A3C6E]">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {users.map((user) => (
                <tr key={user.id} className="transition hover:bg-[#F5F3EE]/50">
                  <td className="px-6 py-4 text-sm text-[#111827]">
                    {user.full_name || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#111827]/80">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-[#111827]">{user.role}</td>
                  <td className="px-6 py-4 text-sm text-[#111827]/80">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoading && (
            <div className="p-6 text-center text-[#111827]/60">Loading users...</div>
          )}
          {!isLoading && users.length === 0 && (
            <div className="p-6 text-center text-[#111827]/60">No users found.</div>
          )}
        </div>
      )}
    </div>
  );
}
