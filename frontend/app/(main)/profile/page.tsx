"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser, type UserProfile } from "@/lib/api/auth-api";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setLoading(true);
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  const profileFields = [
    { label: "Full Name", value: user?.full_name },
    { label: "Email", value: user?.email },
    { label: "Age", value: user?.age },
    { label: "State", value: user?.state },
    { label: "District", value: user?.district },
    { label: "Category", value: user?.category },
    { label: "Education Level", value: user?.education_level },
    { label: "Occupation", value: user?.occupation },
    { label: "User Type", value: user?.user_type },
    { label: "Income Range", value: user?.income_range },
    { label: "Annual Income", value: user?.annual_income },
    { label: "Gender", value: user?.gender },
    { label: "Preferred Language", value: user?.preferred_language },
  ];

  const formatFieldLabel = (label: string): string => {
    // Convert snake_case or camelCase to Title Case
    return label
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      .trim();
  };

  const formatFieldValue = (value: unknown): string => {
    if (value === null || value === undefined || value === "") {
      return "Not filled";
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#9BB6E5] border-t-[#1A3C6E]" />
          <p className="text-sm font-medium text-[#1A3C6E]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3">
          <p className="text-sm text-[#111827]">No profile data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left section: Header and actions */}
        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-lg shadow-[#1A3C6E]/8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
            Your Profile
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#1A3C6E]">
            {user.full_name || "Your Profile"}
          </h1>

          {/* Profile Completion Info */}
          <div className="mt-6 rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] p-4">
            <p className="text-sm font-semibold text-[#1A3C6E]">
              Profile Completion
            </p>
            <p className="mt-2 text-2xl font-bold text-[#1A3C6E]">
              {user.profile_completion_percentage ?? 0}%
            </p>
            {user.profile_completed ? (
              <p className="mt-1 text-sm text-green-600 font-medium">✓ Profile Complete</p>
            ) : (
              <>
                <p className="mt-1 text-sm text-[#111827]/65">
                  {user.missing_profile_fields?.length || 0} field(s) missing
                </p>
                <Link
                  href="/profile/setup"
                  className="mt-4 inline-flex rounded-full bg-[#1A3C6E] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#3B82F6]"
                >
                  Complete Profile
                </Link>
              </>
            )}
          </div>

          {/* Missing Fields */}
          {user.missing_profile_fields && user.missing_profile_fields.length > 0 && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-900">Missing fields:</p>
              <ul className="mt-2 space-y-1">
                {user.missing_profile_fields.map((field) => (
                  <li key={field} className="text-sm text-amber-800">
                    • {formatFieldLabel(field)}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Right section: Profile fields */}
        <section className="rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-lg shadow-[#1A3C6E]/8">
          <h2 className="text-xl font-bold text-[#111827]">Profile Information</h2>
          <div className="mt-5 grid gap-4">
            {profileFields.map(({ label, value }) => (
              <div key={label} className="border-b border-[#E5E7EB] pb-4">
                <p className="text-sm font-semibold text-[#1A3C6E]">{label}</p>
                <p className="mt-1 text-sm text-[#111827]">
                  {formatFieldValue(value)}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
