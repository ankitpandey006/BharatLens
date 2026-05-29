"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function AdminHeader() {
  const router = useRouter();
  const { signOut, isSigningOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-4">
      <h1 className="text-lg font-semibold text-[#1A3C6E]">
        Admin Panel
      </h1>

      <button
        type="button"
        onClick={handleLogout}
        disabled={isSigningOut}
        className="rounded-lg bg-[#1A3C6E] px-4 py-2 text-white transition hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSigningOut ? "Logging out..." : "Logout"}
      </button>
    </header>
  );
}