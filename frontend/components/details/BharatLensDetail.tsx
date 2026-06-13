"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  MapPin,
  GraduationCap,
  Users,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,

  IndianRupee,
  BookOpen,
  Banknote,
  ScrollText,
  Info,
  Bookmark,
  BookmarkCheck,
  Loader2,
  FileCheck,
  SearchCheck,
  BadgeCheck,
  Share2,
  Check,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ─── Available API field types ──────────────────────────────────

interface BaseItem {
  id: string;
  title: string;
  category?: string;
  description?: string;
  eligibility?: string;
  status?: string;
  verification_status?: string;
  official_url?: string;
  apply_url?: string;
  source_url?: string;
  source_name?: string;
  created_at?: string;
  updated_at?: string;
  state?: string;
  deadline?: string;
  verification_notes?: string;
}

export interface BharatLensJob extends BaseItem {
  organization: string;
  location?: string;
  vacancies?: number;
  qualification: string;
  sub_category?: string;
  updates?: { apply?: boolean; admit_card?: boolean; result?: boolean; notification?: boolean };
  updateLinks?: { apply?: string; admit_card?: string; result?: string; notification?: string };
}

export interface BharatLensExam extends BaseItem {
  conductingBody: string;
  examDate?: string;
  applicationDeadline?: string;
  sub_category?: string;
  updates?: { apply?: boolean; admit_card?: boolean; result?: boolean; answer_key?: boolean; notification?: boolean };
  updateLinks?: { apply?: string; admit_card?: string; result?: string; answer_key?: string; notification?: string };
}

export interface BharatLensScheme extends BaseItem {
  provider: string;
  benefit: string;
}

export interface BharatLensScholarship extends BaseItem {
  provider: string;
  amount?: string;
}

type ItemType = "job" | "exam" | "scheme" | "scholarship";

interface FieldConfig {
  label: string;
  icon: LucideIcon;
  value: string | number | undefined | null;
  type?: "text" | "date";
}

// ─── Props ──────────────────────────────────────────────────────

interface BharatLensDetailProps {
  item: BharatLensJob | BharatLensExam | BharatLensScheme | BharatLensScholarship;
  itemType: ItemType;
  backHref: string;
  backLabel: string;
  isSaved: boolean;
  isSaving: boolean;
  onToggleSave: () => void;
  relatedItems?: Array<{ id: string; title: string; subtitle: string; href: string }>;
  relatedTitle?: string;
}

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(dateStr?: string): string | undefined {
  if (!dateStr) return undefined;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function isExpiringSoon(deadline?: string): boolean {
  if (!deadline) return false;
  try {
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return false;
    const diff = d.getTime() - Date.now();
    const days = diff / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 7;
  } catch {
    return false;
  }
}

function isExpired(deadline?: string): boolean {
  if (!deadline) return false;
  try {
    const d = new Date(deadline);
    if (isNaN(d.getTime())) return false;
    return d.getTime() < Date.now();
  } catch {
    return false;
  }
}

// ─── Status helpers ─────────────────────────────────────────────

function getStatusTone(status?: string): "default" | "info" | "warning" | "muted" {
  if (!status) return "muted";
  const s = status.toLowerCase();
  if (s === "open" || s === "active" || s === "published") return "info";
  if (s === "closing soon" || s === "expiring") return "warning";
  if (s === "closed" || s === "expired" || s === "rejected") return "muted";
  return "default";
}

// ─── Component ──────────────────────────────────────────────────

export default function BharatLensDetail({
  item,
  itemType,
  backHref,
  backLabel,
  isSaved,
  isSaving,
  onToggleSave,
  relatedItems,
  relatedTitle,
}: BharatLensDetailProps) {
  const deadline = item.deadline;
  const expiringSoon = isExpiringSoon(deadline);
  const expired = isExpired(deadline);

  const typeLabel = useMemo(() => {
    switch (itemType) {
      case "job": return "Job";
      case "exam": return "Exam";
      case "scheme": return "Scheme";
      case "scholarship": return "Scholarship";
    }
  }, [itemType]);

  // ─── Build info fields ────────────────────────────────────────

  const infoFields = useMemo((): FieldConfig[] => {
    const fields: FieldConfig[] = [];

    switch (itemType) {
      case "job": {
        const j = item as BharatLensJob;
        if (j.organization) fields.push({ label: "Organization", icon: Building2, value: j.organization });
        if (j.category) fields.push({ label: "Category", icon: BookOpen, value: j.category });
        if (item.state) fields.push({ label: "State", icon: MapPin, value: item.state });
        if (j.location) fields.push({ label: "Location", icon: MapPin, value: j.location });
        if (j.qualification) fields.push({ label: "Qualification", icon: GraduationCap, value: j.qualification });
        if (j.vacancies !== undefined && j.vacancies !== null)
          fields.push({ label: "Vacancies", icon: Users, value: j.vacancies });
        break;
      }
      case "exam": {
        const e = item as BharatLensExam;
        if (e.conductingBody) fields.push({ label: "Conducting Body", icon: Building2, value: e.conductingBody });
        if (e.category) fields.push({ label: "Category", icon: BookOpen, value: e.category });
        if (item.state) fields.push({ label: "State", icon: MapPin, value: item.state });
        if (e.sub_category) fields.push({ label: "Exam Type", icon: ScrollText, value: e.sub_category });
        break;
      }
      case "scheme": {
        const s = item as BharatLensScheme;
        if (s.provider) fields.push({ label: "Provider", icon: Building2, value: s.provider });
        if (item.category) fields.push({ label: "Category", icon: BookOpen, value: item.category });
        if (item.state) fields.push({ label: "State", icon: MapPin, value: item.state });
        if (s.benefit) fields.push({ label: "Benefit", icon: IndianRupee, value: s.benefit });
        break;
      }
      case "scholarship": {
        const s = item as BharatLensScholarship;
        if (s.provider) fields.push({ label: "Provider", icon: Building2, value: s.provider });
        if (item.category) fields.push({ label: "Category", icon: BookOpen, value: item.category });
        if (item.state) fields.push({ label: "State", icon: MapPin, value: item.state });
        if (s.amount) fields.push({ label: "Amount", icon: Banknote, value: s.amount });
        break;
      }
    }

    return fields;
  }, [item, itemType]);

  // ─── Build important dates ────────────────────────────────────

  const dateFields = useMemo((): FieldConfig[] => {
    const fields: FieldConfig[] = [];

    if (deadline) {
      fields.push({
        label: expired ? "Deadline (Expired)" : expiringSoon ? "Deadline (Closing Soon)" : "Deadline",
        icon: Calendar,
        value: formatDate(deadline) ?? deadline,
      });
    }

    switch (itemType) {
      case "exam": {
        const e = item as BharatLensExam;
        if (e.examDate) fields.push({ label: "Exam Date", icon: Calendar, value: formatDate(e.examDate) ?? e.examDate });
        if (e.applicationDeadline) fields.push({ label: "Application Deadline", icon: Calendar, value: formatDate(e.applicationDeadline) ?? e.applicationDeadline });
        break;
      }
    }

    if (item.updated_at) fields.push({ label: "Last Updated", icon: Clock, value: formatDate(item.updated_at) ?? item.updated_at });
    if (item.created_at && item.updated_at !== item.created_at) fields.push({ label: "Published On", icon: Clock, value: formatDate(item.created_at) ?? item.created_at });

    return fields;
  }, [item, deadline, expired, expiringSoon]);

  // ─── Build action buttons ─────────────────────────────────────

  const actionButtons = useMemo(() => {
    const buttons: Array<{ label: string; href: string; icon: LucideIcon; primary?: boolean }> = [];

    switch (itemType) {
      case "job": {
        const j = item as BharatLensJob;
        if (j.apply_url) buttons.push({ label: "Apply Now", href: j.apply_url, icon: ExternalLink, primary: true });
        else if (j.official_url) buttons.push({ label: "Apply Now", href: j.official_url, icon: ExternalLink, primary: true });
        // Check updateLinks for additional action links
        if (j.updateLinks?.admit_card) buttons.push({ label: "Download Admit Card", href: j.updateLinks.admit_card, icon: FileCheck });
        if (j.updateLinks?.result) buttons.push({ label: "View Result", href: j.updateLinks.result, icon: SearchCheck });
        if (j.updateLinks?.notification) buttons.push({ label: "View Notification", href: j.updateLinks.notification, icon: FileText });
        // Official website if different from apply_url
        if (j.official_url && j.official_url !== j.apply_url) buttons.push({ label: "Official Website", href: j.official_url, icon: ExternalLink });
        break;
      }
      case "exam": {
        const e = item as BharatLensExam;
        if (e.apply_url) buttons.push({ label: "Apply Now", href: e.apply_url, icon: ExternalLink, primary: true });
        if (e.updateLinks?.admit_card) buttons.push({ label: "Download Admit Card", href: e.updateLinks.admit_card, icon: FileCheck });
        if (e.updateLinks?.result) buttons.push({ label: "View Result", href: e.updateLinks.result, icon: SearchCheck });
        if (e.updateLinks?.answer_key) buttons.push({ label: "View Answer Key", href: e.updateLinks.answer_key, icon: BadgeCheck });
        if (e.updateLinks?.notification) buttons.push({ label: "View Notification", href: e.updateLinks.notification, icon: FileText });
        if (e.official_url) buttons.push({ label: "Official Website", href: e.official_url, icon: ExternalLink });
        break;
      }
      case "scheme": {
        const s = item as BharatLensScheme;
        if (s.apply_url) buttons.push({ label: "Check Eligibility", href: s.apply_url, icon: ExternalLink, primary: true });
        if (s.official_url) buttons.push({ label: "Official Website", href: s.official_url, icon: ExternalLink });
        break;
      }
      case "scholarship": {
        const s = item as BharatLensScholarship;
        if (s.apply_url) buttons.push({ label: "Apply Scholarship", href: s.apply_url, icon: ExternalLink, primary: true });
        if (s.official_url) buttons.push({ label: "Official Website", href: s.official_url, icon: ExternalLink });
        break;
      }
    }

    // Deduplicate by href
    const seen = new Set<string>();
    return buttons.filter((b) => {
      if (seen.has(b.href)) return false;
      seen.add(b.href);
      return true;
    });
  }, [item, itemType]);

  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available
    }
  }, []);

  const primaryButton = actionButtons.find((b) => b.primary);
  const secondaryButtons = actionButtons.filter((b) => !b.primary);

  return (
    <section className="min-h-screen bg-[#F5F3EE]">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8 sm:py-10">
        {/* ─── Back Link ─────────────────────────────────── */}
        <Link
          href={backHref}
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-[#3B82F6] transition-colors hover:text-[#1A3C6E]"
        >
          <ArrowLeft className="h-4 w-4" />
          {backLabel}
        </Link>

        {/* ─── Hero Card ────────────────────────────────── */}
        <Card className="overflow-hidden border-[#E5E7EB] shadow-sm transition-shadow hover:shadow-md">
          {/* Accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-[#1A3C6E] via-[#3B82F6] to-[#9BB6E5]" />

          <CardContent className="space-y-4 pt-6 sm:pt-8">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{typeLabel}</Badge>
              {item.verification_status === "verified" || item.status === "verified" ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Official Source
                </span>
              ) : null}
              {item.status ? (
                <Badge tone={getStatusTone(item.status)}>{item.status}</Badge>
              ) : null}
              {expiringSoon ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                  Closing Soon
                </span>
              ) : null}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl lg:text-4xl leading-tight">
              {item.title}
            </h1>

            {/* Description / summary */}
            {item.description ? (
              <p className="text-sm leading-6 text-[#111827]/70 sm:text-base sm:leading-7 line-clamp-3">
                {item.description}
              </p>
            ) : null}

            {/* Updated date */}
            {item.updated_at ? (
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#F5F3EE] px-3 py-1.5 text-xs font-medium text-[#6B7280]">
                <Clock className="h-3.5 w-3.5" />
                Updated: {formatDate(item.updated_at) ?? item.updated_at}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* ─── Main Content Grid ────────────────────────── */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* ─── Left Column ────────────────────────────── */}
          <div className="space-y-6">
            {/* Info Grid */}
            {infoFields.length > 0 ? (
              <Card className="border-[#E5E7EB] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Info className="h-4 w-4 text-[#3B82F6]" />
                    Important Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                    {infoFields.map((field) => (
                      <div key={field.label} className="flex items-start gap-2.5">
                        <field.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#3B82F6]" />
                        <div className="min-w-0">
                          <p className="text-xs font-medium uppercase tracking-wider text-[#6B7280]">
                            {field.label}
                          </p>
                          <p className="mt-0.5 text-sm font-medium text-[#111827] break-words">
                            {field.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Overview / Description */}
            {item.description ? (
              <Card className="border-[#E5E7EB] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <FileText className="h-4 w-4 text-[#3B82F6]" />
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none text-[#111827]/80 leading-7 whitespace-pre-line">
                    {item.description}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Eligibility */}
            {item.eligibility ? (
              <Card className="border-[#E5E7EB] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <CheckCircle2 className="h-4 w-4 text-[#3B82F6]" />
                    Eligibility
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm leading-7 text-[#111827]/80 whitespace-pre-line">
                    {item.eligibility}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          {/* ─── Right Column (Sidebar) ─────────────────── */}
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            {/* Important Dates */}
            {dateFields.length > 0 ? (
              <Card className="border-[#E5E7EB] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-4 w-4 text-[#3B82F6]" />
                    Important Dates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dateFields.map((field) => {
                      const isDeadline = field.label.includes("Deadline");
                      const isExpiredDeadline = field.label.includes("Expired");
                      return (
                        <div
                          key={field.label}
                          className={`rounded-lg px-3 py-2.5 ${
                            isExpiredDeadline
                              ? "bg-red-50"
                              : isDeadline && expiringSoon
                              ? "bg-amber-50"
                              : "bg-[#F5F3EE]"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <field.icon
                              className={`h-4 w-4 ${
                                isExpiredDeadline
                                  ? "text-red-500"
                                  : isDeadline && expiringSoon
                                  ? "text-amber-500"
                                  : "text-[#3B82F6]"
                              }`}
                            />
                            <div>
                              <p
                                className={`text-xs font-medium ${
                                  isExpiredDeadline
                                    ? "text-red-600"
                                    : isDeadline && expiringSoon
                                    ? "text-amber-600"
                                    : "text-[#6B7280]"
                                }`}
                              >
                                {field.label}
                              </p>
                              <p
                                className={`text-sm font-semibold ${
                                  isExpiredDeadline
                                    ? "text-red-700"
                                    : isDeadline && expiringSoon
                                    ? "text-amber-700"
                                    : "text-[#111827]"
                                }`}
                              >
                                {field.value}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Source / Source Name */}
            {item.source_name ? (
              <Card className="border-[#E5E7EB] shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-[#3B82F6]" />
                    Source
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium text-[#111827]">{item.source_name}</p>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </div>

        {/* ─── Action Buttons ───────────────────────────── */}
        {actionButtons.length > 0 ? (
          <div className="mt-6">
            <Card className="border-[#E5E7EB] shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ExternalLink className="h-4 w-4 text-[#3B82F6]" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Save button */}
                  <Button
                    variant={isSaved ? "secondary" : "outline"}
                    size="lg"
                    onClick={onToggleSave}
                    disabled={isSaving}
                    className="min-h-[44px] min-w-[44px]"
                    aria-label={isSaved ? "Remove from saved" : "Save item"}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : isSaved ? (
                      <BookmarkCheck className="mr-1.5 h-4 w-4" />
                    ) : (
                      <Bookmark className="mr-1.5 h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
                  </Button>

                  {/* Share button */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="min-h-[44px] gap-1.5"
                    aria-label="Copy link to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        Share
                      </>
                    )}
                  </Button>

                  {/* Primary action */}
                  {primaryButton ? (
                    <a
                      href={primaryButton.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button size="lg" className="min-h-[44px] gap-1.5">
                        {primaryButton.label}
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  ) : null}

                  {/* Secondary actions */}
                  {secondaryButtons.map((btn) => (
                    <a
                      key={btn.href}
                      href={btn.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="outline" size="lg" className="min-h-[44px] gap-1.5">
                        <btn.icon className="h-4 w-4" />
                        {btn.label}
                      </Button>
                    </a>
                  ))}

                  {/* Share / Back button */}
                  <Link href={backHref}>
                    <Button variant="ghost" size="lg" className="min-h-[44px]">
                      <ArrowLeft className="mr-1.5 h-4 w-4" />
                      Back to {backLabel.replace("Back to ", "")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-6">
            <Card className="border-[#E5E7EB] shadow-sm">
              <CardContent className="pt-5">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    variant={isSaved ? "secondary" : "outline"}
                    size="lg"
                    onClick={onToggleSave}
                    disabled={isSaving}
                    className="min-h-[44px]"
                    aria-label={isSaved ? "Remove from saved" : "Save item"}
                  >
                    {isSaving ? (
                      <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                    ) : isSaved ? (
                      <BookmarkCheck className="mr-1.5 h-4 w-4" />
                    ) : (
                      <Bookmark className="mr-1.5 h-4 w-4" />
                    )}
                    {isSaving ? "Saving..." : isSaved ? "Saved" : "Save"}
                  </Button>
                  {/* Share button */}
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="min-h-[44px] gap-1.5"
                    aria-label="Copy link to clipboard"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="h-4 w-4" />
                        Share
                      </>
                    )}
                  </Button>
                  <Link href={backHref}>
                    <Button variant="ghost" size="lg" className="min-h-[44px]">
                      <ArrowLeft className="mr-1.5 h-4 w-4" />
                      Back to {backLabel.replace("Back to ", "")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Verification Notes ─────────────────────── */}
        {item.verification_notes ? (
          <div className="mt-4">
            <Card className="border-[#E5E7EB] shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <ShieldCheck className="h-4 w-4 text-[#3B82F6]" />
                  Verification Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-[#111827]/80 whitespace-pre-line">
                  {item.verification_notes}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {/* ─── Source URL ───────────────────────────────── */}
        {item.source_url && (
          <div className="mt-4">
            <Card className="border-[#E5E7EB] shadow-sm">
              <CardContent className="pt-5">
                <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                  <ExternalLink className="h-4 w-4 shrink-0" />
                  <span>Source: </span>
                  <a
                    href={item.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="truncate text-[#3B82F6] underline-offset-2 transition hover:text-[#1A3C6E] hover:underline"
                  >
                    {item.source_url}
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ─── Related Items ────────────────────────────── */}
        {relatedItems && relatedItems.length > 0 && (
          <section className="mt-10">
            <h2 className="text-xl font-semibold text-[#1A3C6E] sm:text-2xl">
              {relatedTitle ?? `Related ${typeLabel}s`}
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedItems.map((rel) => (
                <Link key={rel.id} href={rel.href}>
                  <Card className="h-full border-[#E5E7EB] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#9BB6E5] hover:shadow-md">
                    <CardContent className="space-y-2 pt-5">
                      <h3 className="line-clamp-2 text-sm font-semibold text-[#1A3C6E]">
                        {rel.title}
                      </h3>
                      {rel.subtitle ? (
                        <p className="line-clamp-1 text-xs text-[#6B7280]">{rel.subtitle}</p>
                      ) : null}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
