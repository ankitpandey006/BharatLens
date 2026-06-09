"use client";

import { fetchAdminUsers } from "@/lib/api/admin";
import useSWR from "swr";

export default function UsersPage() {
  const { data: users, error, isLoading } = useSWR("admin/users", fetchAdminUsers, {
    dedupingInterval: 10000,
    revalidateOnFocus: false,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl">User Management</h1>
        <p className="mt-2 text-[#111827]/60">Monitor and manage BharatLens user accounts.</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[#FECACA] bg-red-50 p-6 text-sm text-red-700">{error instanceof Error ? error.message : String(error)}</div>
      ) : isLoading ? (
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-white/50" />
          ))}
        </div>
      ) : !users || users.length === 0 ? (
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center text-[#111827]/60">No users found.</div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-sm md:block">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-[#E5E7EB] bg-[#F5F3EE] text-left text-sm font-semibold text-[#1A3C6E]">
                  <th className="px-6 py-4">Name</th><th className="px-6 py-4">Email</th><th className="px-6 py-4">Role</th><th className="px-6 py-4">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {users.map((user) => (
                  <tr key={user.id} className="transition hover:bg-[#F5F3EE]/50">
                    <td className="px-6 py-4 text-sm text-[#111827]">{user.full_name || "—"}</td>
                    <td className="max-w-xs truncate px-6 py-4 text-sm text-[#111827]/80">{user.email}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]">{user.role}</td>
                    <td className="px-6 py-4 text-sm text-[#111827]/80">{user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="space-y-3 md:hidden">
            {users.map((user) => (
              <div key={user.id} className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111827] truncate">{user.full_name || "—"}</p>
                    <p className="mt-0.5 text-xs text-[#111827]/60 truncate">{user.email}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-[#F5F3EE] px-2.5 py-1 text-xs font-medium text-[#1A3C6E]">{user.role}</span>
                </div>
                <p className="mt-2 text-xs text-[#111827]/50">Created: {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
