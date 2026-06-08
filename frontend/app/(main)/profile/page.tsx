"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  MapPin,
  BookOpen,
  Briefcase,
  IndianRupee,
  GraduationCap,
  Tags,
  Globe,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Shield,
} from "lucide-react";
import { getCurrentUser, type UserProfile } from "@/lib/api/auth-api";

// ─── Helpers ───────────────────────────────────────────────────────

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
    .trim();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "Not filled";
  return String(value);
}

// ─── Section config ────────────────────────────────────────────────

interface FieldGroup {
  label: string;
  key: keyof UserProfile;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const FIELD_GROUPS: { title: string; icon: React.ComponentType<{ size?: number; className?: string }>; fields: FieldGroup[] }[] = [
  {
    title: "Personal Information",
    icon: User,
    fields: [
      { label: "Full Name", key: "full_name", icon: User },
      { label: "Email", key: "email", icon: Mail },
      { label: "Age", key: "age", icon: Calendar },
      { label: "Gender", key: "gender", icon: User },
      { label: "Date of Birth", key: "dob", icon: Calendar },
    ],
  },
  {
    title: "Location & Category",
    icon: MapPin,
    fields: [
      { label: "State", key: "state", icon: MapPin },
      { label: "Category", key: "category", icon: Tags },
    ],
  },
  {
    title: "Education & Work",
    icon: GraduationCap,
    fields: [
      { label: "Education Level", key: "education_level", icon: BookOpen },
      { label: "Occupation", key: "occupation", icon: Briefcase },
      { label: "User Type", key: "user_type", icon: Shield },
    ],
  },
  {
    title: "Financial & Preferences",
    icon: IndianRupee,
    fields: [
      { label: "Income Range", key: "income_range", icon: IndianRupee },
      { label: "Annual Income", key: "annual_income", icon: IndianRupee },
      { label: "Preferred Language", key: "preferred_language", icon: Globe },
    ],
  },
];

// ─── Profile Page ──────────────────────────────────────────────────

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await getCurrentUser();
        if (!cancelled) setUser(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load profile");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadProfile();
    return () => { cancelled = true; };
  }, []);

  // ── Skeleton ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="animate-pulse rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:rounded-3xl sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
            <div className="space-y-5">
              <div className="h-5 w-28 rounded-lg bg-[#E5E7EB]" />
              <div className="h-8 w-48 rounded-lg bg-[#E5E7EB]" />
              <div className="h-32 rounded-2xl bg-[#F5F3EE]" />
            </div>
            <div className="space-y-5">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl border border-[#E5E7EB] p-5">
                  <div className="h-4 w-32 rounded bg-[#E5E7EB]" />
                  <div className="mt-4 space-y-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-10 rounded-lg bg-[#F5F3EE]" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
          <AlertCircle size={18} className="shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  // ── Empty ─────────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-[#111827]/60">No profile data available.</p>
        </div>
      </div>
    );
  }

  const completionPercent = user.profile_completion_percentage ?? 0;
  const isComplete = user.profile_completed === true;
  const missingFields = user.missing_profile_fields ?? [];

  // ── Render ────────────────────────────────────────────────────────

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* ═══ Left Column — Summary & Completion ═══ */}
        <div className="space-y-5">
          {/* Profile summary */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-sm sm:rounded-3xl sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
              Your Profile
            </p>
            <h1 className="mt-2 text-2xl font-bold text-[#1A3C6E] sm:text-3xl">
              {user.full_name || "Your Profile"}
            </h1>
            <p className="mt-1 text-sm text-[#111827]/55">{user.email}</p>
          </div>

          {/* Profile Completion Card */}
          <div
            className={`rounded-2xl border p-6 shadow-sm sm:rounded-3xl sm:p-7 ${
              isComplete
                ? "border-green-200 bg-gradient-to-br from-green-50 to-green-100/50"
                : "border-[#E5E7EB] bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#1A3C6E]">
                Profile Completion
              </p>
              {isComplete ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-600/10 px-3 py-1 text-xs font-semibold text-green-700">
                  <CheckCircle2 size={14} />
                  Complete
                </span>
              ) : (
                <span className="rounded-full bg-[#F5F3EE] px-3 py-1 text-xs font-semibold text-[#111827]/60">
                  {completionPercent}%
                </span>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mt-4 h-2.5 rounded-full bg-[#E5E7EB]">
              <div
                className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                  isComplete
                    ? "bg-gradient-to-r from-green-500 to-emerald-500"
                    : "bg-gradient-to-r from-[#3B82F6] to-[#1A3C6E]"
                }`}
                style={{ width: `${Math.max(completionPercent, 4)}%` }}
              />
            </div>

            <p className="mt-3 text-sm leading-5 text-[#111827]/60">
              {isComplete
                ? "✓ Your profile is complete! You'll get the best personalized recommendations."
                : `Complete your profile (${completionPercent}%) for better recommendations.`}
            </p>

            {!isComplete && (
              <Link
                href="/profile/setup"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1A3C6E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#3B82F6] sm:w-auto"
              >
                Complete Profile
                <ArrowRight size={15} />
              </Link>
            )}
          </div>

          {/* Missing Fields (if incomplete) */}
          {!isComplete && missingFields.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    {missingFields.length} field{missingFields.length !== 1 ? "s" : ""} missing
                  </p>
                  <ul className="mt-2 space-y-1">
                    {missingFields.map((f) => (
                      <li key={f} className="text-xs text-amber-800">
                        {formatLabel(f)}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ═══ Right Column — Profile Data Sections ═══ */}
        <div className="space-y-5">
          {FIELD_GROUPS.map((group) => {
            const GroupIcon = group.icon;
            const visibleFields = group.fields.filter((f) => user[f.key] !== undefined);

            if (visibleFields.length === 0) return null;

            return (
              <div
                key={group.title}
                className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm sm:rounded-3xl sm:p-6"
              >
                <div className="mb-4 flex items-center gap-2.5 border-b border-[#E5E7EB] pb-3.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F5F3EE]">
                    <GroupIcon size={15} className="text-[#1A3C6E]" />
                  </div>
                  <h2 className="text-sm font-bold text-[#111827]">{group.title}</h2>
                </div>

                <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                  {visibleFields.map((field) => {
                    const FieldIcon = field.icon;
                    const val = formatValue(user[field.key]);

                    return (
                      <div key={field.key} className="min-w-0">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-[#111827]/50">
                          <FieldIcon size={12} />
                          {field.label}
                        </p>
                        <p
                          className={`mt-1 text-sm font-semibold ${
                            val === "Not filled"
                              ? "text-[#111827]/30 italic"
                              : "text-[#111827]"
                          }`}
                        >
                          {val}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Account meta */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white px-5 py-4 shadow-sm sm:rounded-3xl sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#111827]/45">
              {user.created_at && (
                <span>Member since {new Date(user.created_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
              )}
              {user.updated_at && (
                <span>Last updated {new Date(user.updated_at).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
