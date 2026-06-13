"use client";

import { useEffect, useState, useCallback } from "react";
import { X, Copy, ExternalLink, Save, Check, AlertTriangle, Trash2, Eye, FileText } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { AdminItem, ItemType } from "@/types/admin";

const SUB_CATEGORY_OPTIONS_JOB = [
  { value: "apply_now", label: "Apply Now" },
  { value: "admit_card", label: "Admit Card" },
  { value: "result", label: "Result" },
  { value: "notification", label: "Notifications" },
];

const SUB_CATEGORY_OPTIONS_EXAM = [
  { value: "apply_now", label: "Apply Now" },
  { value: "admit_card", label: "Admit Card" },
  { value: "result", label: "Result" },
  { value: "answer_key", label: "Answer Key" },
  { value: "notification", label: "Notifications" },
];

const CATEGORY_OPTIONS = [
  "general", "obc", "sc", "st", "ebc", "women", "minority", "ews", "disability",
];

interface SlidePanelProps {
  item: AdminItem | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, notes?: string, edits?: Record<string, unknown>) => Promise<void>;
  onReject: (id: string, reason: string, notes?: string) => Promise<void>;
  onPublish: (id: string) => Promise<void>;
  onUnpublish: (id: string) => Promise<void>;
  onRestore: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onSave: (id: string, updates: Record<string, unknown>) => Promise<void>;
  onRefresh: () => void;
}

function DynamicFields({ item, edited, setEdited, isLoading, isPublished }: {
  item: AdminItem;
  edited: Record<string, unknown>;
  setEdited: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  isLoading: boolean;
  isPublished: boolean;
}) {
  const r = item as unknown as Record<string, unknown>;
  const it = String(edited.item_type || item.type);
  const isJobOrExam = it === "job" || it === "exam";
  // Default sub_category: for scheme/scholarship null; for job/exam use existing or default
  const currentSubCategory = isJobOrExam
    ? String(edited.sub_category || edited.content_action || item.contentAction || r.content_action || r.sub_category || "")
    : "";

  // Auto-reset sub_category when type changes — run only when item.id OR item_type changes
  useEffect(() => {
    const prevType = item.type;
    const prevIsJobOrExam = prevType === "job" || prevType === "exam";
    if (!isJobOrExam && prevIsJobOrExam) {
      // Changed from job/exam to scheme/scholarship — clear sub_category
      setEdited((p) => {
        if (!p.sub_category && !p.content_action) return p;
        const next = { ...p, sub_category: null, content_action: null };
        return next;
      });
    } else if (isJobOrExam && !prevIsJobOrExam) {
      // Changed from scheme/scholarship to job/exam — default to apply_now
      setEdited((p) => {
        if (p.sub_category || p.content_action) return p;
        return { ...p, sub_category: "apply_now", content_action: "apply_now" };
      });
    } else if (isJobOrExam && prevIsJobOrExam && !edited.sub_category && !edited.content_action) {
      // Both are job/exam but sub_category is not set — try to preserve original
      setEdited((p) => {
        if (p.sub_category || p.content_action) return p;
        const original = item.contentAction || r.content_action || r.sub_category;
        return { ...p, sub_category: original || "apply_now", content_action: original || "apply_now" };
      });
    }
    // Only run when item.id or item_type changes — NOT on setEdited changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [it, item.id]);

  // ── Common fields for all types ──
  const common = (
    <>
      {/* Title */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Title</label>
        <input type="text" defaultValue={item.title || ""}
          onChange={(e) => setEdited((p) => ({ ...p, title: e.target.value }))}
          disabled={isPublished || isLoading}
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
        />
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Description</label>
        <textarea rows={3} defaultValue={item.description || item.summary || ""}
          onChange={(e) => setEdited((p) => ({ ...p, description: e.target.value }))}
          disabled={isPublished || isLoading}
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
        />
      </div>

      {/* Type grid: Type + (Sub Type only if job/exam) + Category */}
      <div className={`grid ${isJobOrExam ? "grid-cols-3" : "grid-cols-2"} gap-3`}>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Type</label>
          <select defaultValue={item.type}
            onChange={(e) => setEdited((p) => ({ ...p, item_type: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          >
            <option value="scheme">Scheme</option>
            <option value="scholarship">Scholarship</option>
            <option value="job">Job</option>
            <option value="exam">Exam</option>
          </select>
        </div>
        {isJobOrExam && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Sub Type</label>
            <select value={currentSubCategory || 'apply_now'}
              onChange={(e) => setEdited((p) => ({ ...p, sub_category: e.target.value, content_action: e.target.value }))}
              disabled={isPublished || isLoading}
              className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
            >
              {(it === "exam" ? SUB_CATEGORY_OPTIONS_EXAM : SUB_CATEGORY_OPTIONS_JOB).map((a) => (
                <option key={a.value} value={a.value}>{a.label}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Category</label>
          <select defaultValue={CATEGORY_OPTIONS.includes(item.category) ? item.category : "general"}
            onChange={(e) => setEdited((p) => ({ ...p, category: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Official URL */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Official URL</label>
        <input type="url" defaultValue={String(r.official_url || r.apply_url || item.sourceUrl || item.rawUrl || "")}
          onChange={(e) => setEdited((p) => ({ ...p, official_url: e.target.value }))}
          disabled={isPublished || isLoading}
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
        />
      </div>
    </>
  );

  // ── Scheme-specific fields ──
  const schemeFields = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">State</label>
          <input type="text" defaultValue={item.state || ""}
            onChange={(e) => setEdited((p) => ({ ...p, state: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Last Date</label>
          <input type="date" defaultValue={item.deadline ? item.deadline.split("T")[0] : ""}
            onChange={(e) => setEdited((p) => ({ ...p, deadline: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Eligibility</label>
        <textarea rows={2} defaultValue={item.eligibility || ""}
          onChange={(e) => setEdited((p) => ({ ...p, eligibility: e.target.value }))}
          disabled={isPublished || isLoading}
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Benefits</label>
          <textarea rows={2} defaultValue={item.benefits || ""}
            onChange={(e) => setEdited((p) => ({ ...p, benefits: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Required Documents</label>
          <textarea rows={2} defaultValue={String(r.required_documents || r.documents || "")}
            onChange={(e) => setEdited((p) => ({ ...p, required_documents: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Start Date</label>
          <input type="date" defaultValue={String(r.start_date || "").split("T")[0] || ""}
            onChange={(e) => setEdited((p) => ({ ...p, start_date: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
    </>
  );

  // ── Scholarship-specific fields ──
  const scholarshipFields = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">State</label>
          <input type="text" defaultValue={item.state || ""}
            onChange={(e) => setEdited((p) => ({ ...p, state: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Last Date</label>
          <input type="date" defaultValue={item.deadline ? item.deadline.split("T")[0] : ""}
            onChange={(e) => setEdited((p) => ({ ...p, deadline: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Scholarship Amount</label>
          <input type="text" defaultValue={String(r.amount || "")}
            onChange={(e) => setEdited((p) => ({ ...p, amount: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Income Limit</label>
          <input type="text" defaultValue={String(r.income_limit || "")}
            onChange={(e) => setEdited((p) => ({ ...p, income_limit: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Education Level</label>
          <input type="text" defaultValue={String(r.education_level || "")}
            onChange={(e) => setEdited((p) => ({ ...p, education_level: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Required Documents</label>
          <textarea rows={2} defaultValue={String(r.required_documents || r.documents || "")}
            onChange={(e) => setEdited((p) => ({ ...p, required_documents: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Eligibility</label>
        <textarea rows={2} defaultValue={item.eligibility || ""}
          onChange={(e) => setEdited((p) => ({ ...p, eligibility: e.target.value }))}
          disabled={isPublished || isLoading}
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
        />
      </div>
    </>
  );

  // ── Job-specific fields ──
  const jobFields = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Organization</label>
          <input type="text" defaultValue={String(r.organization || "")}
            onChange={(e) => setEdited((p) => ({ ...p, organization: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Vacancies</label>
          <input type="text" defaultValue={String(r.vacancies || "")}
            onChange={(e) => setEdited((p) => ({ ...p, vacancies: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Education</label>
          <input type="text" defaultValue={String(r.education || r.qualification || "")}
            onChange={(e) => setEdited((p) => ({ ...p, education: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Age Limit</label>
          <input type="text" defaultValue={String(r.age_limit || "")}
            onChange={(e) => setEdited((p) => ({ ...p, age_limit: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Salary</label>
          <input type="text" defaultValue={String(r.salary || "")}
            onChange={(e) => setEdited((p) => ({ ...p, salary: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Application Fee</label>
          <input type="text" defaultValue={String(r.application_fee || "")}
            onChange={(e) => setEdited((p) => ({ ...p, application_fee: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Selection Process</label>
        <textarea rows={2} defaultValue={String(r.selection_process || "")}
          onChange={(e) => setEdited((p) => ({ ...p, selection_process: e.target.value }))}
          disabled={isPublished || isLoading}
          className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
        />
      </div>
    </>
  );

  // ── Exam-specific fields ──
  const examFields = (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Conducting Body</label>
          <input type="text" defaultValue={String(r.conducting_body || r.conductingBody || "")}
            onChange={(e) => setEdited((p) => ({ ...p, conducting_body: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Education</label>
          <input type="text" defaultValue={String(r.education || r.qualification || "")}
            onChange={(e) => setEdited((p) => ({ ...p, education: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Age Limit</label>
          <input type="text" defaultValue={String(r.age_limit || "")}
            onChange={(e) => setEdited((p) => ({ ...p, age_limit: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Exam Date</label>
          <input type="date" defaultValue={String(r.exam_date || r.examDate || "").split("T")[0] || ""}
            onChange={(e) => setEdited((p) => ({ ...p, exam_date: e.target.value }))}
            disabled={isPublished || isLoading}
            className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
          />
        </div>
      </div>
    </>
  );

  // ── Sub-type specific fields (for job/exam) ──
  const subtypeFields = () => {
    if (it !== "job" && it !== "exam") return null;

    switch (currentSubCategory || 'apply_now') {
      case "apply":
        return (
          <div className="rounded-lg border border-[#E5E7EB] bg-blue-50/30 p-3 space-y-3">
            <p className="text-xs font-semibold uppercase text-[#111827]/60">Apply Details</p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Apply Link</label>
              <input type="url" defaultValue={String(r.apply_url || "")}
                onChange={(e) => setEdited((p) => ({ ...p, apply_url: e.target.value }))}
                disabled={isPublished || isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Application Fee</label>
                <input type="text" defaultValue={String(r.application_fee || "")}
                  onChange={(e) => setEdited((p) => ({ ...p, application_fee: e.target.value }))}
                  disabled={isPublished || isLoading}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Last Date</label>
                <input type="date" defaultValue={item.deadline ? item.deadline.split("T")[0] : ""}
                  onChange={(e) => setEdited((p) => ({ ...p, deadline: e.target.value }))}
                  disabled={isPublished || isLoading}
                  className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
                />
              </div>
            </div>
          </div>
        );
      case "admit_card":
        return (
          <div className="rounded-lg border border-[#E5E7EB] bg-orange-50/30 p-3 space-y-3">
            <p className="text-xs font-semibold uppercase text-[#111827]/60">Admit Card Details</p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Admit Card Link</label>
              <input type="url" defaultValue={String(r.admit_card_url || "")}
                onChange={(e) => setEdited((p) => ({ ...p, admit_card_url: e.target.value }))}
                disabled={isPublished || isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Exam Date</label>
              <input type="date" defaultValue={String(r.exam_date || r.examDate || "").split("T")[0] || ""}
                onChange={(e) => setEdited((p) => ({ ...p, exam_date: e.target.value }))}
                disabled={isPublished || isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
              />
            </div>
          </div>
        );
      case "result":
        return (
          <div className="rounded-lg border border-[#E5E7EB] bg-green-50/30 p-3 space-y-3">
            <p className="text-xs font-semibold uppercase text-[#111827]/60">Result Details</p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Result Link</label>
              <input type="url" defaultValue={String(r.result_url || "")}
                onChange={(e) => setEdited((p) => ({ ...p, result_url: e.target.value }))}
                disabled={isPublished || isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Result Date</label>
              <input type="date" defaultValue={String(r.result_date || "").split("T")[0] || ""}
                onChange={(e) => setEdited((p) => ({ ...p, result_date: e.target.value }))}
                disabled={isPublished || isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
              />
            </div>
          </div>
        );
      case "answer_key":
        return (
          <div className="rounded-lg border border-[#E5E7EB] bg-purple-50/30 p-3 space-y-3">
            <p className="text-xs font-semibold uppercase text-[#111827]/60">Answer Key Details</p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Answer Key Link</label>
              <input type="url" defaultValue={String(r.answer_key_url || "")}
                onChange={(e) => setEdited((p) => ({ ...p, answer_key_url: e.target.value }))}
                disabled={isPublished || isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Challenge Last Date</label>
              <input type="date" defaultValue={String(r.challenge_last_date || "").split("T")[0] || ""}
                onChange={(e) => setEdited((p) => ({ ...p, challenge_last_date: e.target.value }))}
                disabled={isPublished || isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
              />
            </div>
          </div>
        );
      case "notification":
        return (
          <div className="rounded-lg border border-[#E5E7EB] bg-gray-50/30 p-3 space-y-3">
            <p className="text-xs font-semibold uppercase text-[#111827]/60">Notification Details</p>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Notification Link / PDF</label>
              <input type="url" defaultValue={String(r.notification_url || r.official_url || "")}
                onChange={(e) => setEdited((p) => ({ ...p, notification_url: e.target.value }))}
                disabled={isPublished || isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Notification Date</label>
              <input type="date" defaultValue={String(r.notification_date || "").split("T")[0] || ""}
                onChange={(e) => setEdited((p) => ({ ...p, notification_date: e.target.value }))}
                disabled={isPublished || isLoading}
                className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {common}
      {it === "scheme" && schemeFields}
      {it === "scholarship" && scholarshipFields}
      {it === "job" && jobFields}
      {it === "exam" && examFields}
      {(it === "job" || it === "exam") && subtypeFields()}
    </>
  );
}

export default function SlidePanel({
  item, isOpen, onClose, onApprove, onReject, onPublish, onUnpublish,
  onRestore, onDelete, onSave, onRefresh,
}: SlidePanelProps) {
  const [edited, setEdited] = useState<Record<string, unknown>>({});
  const [adminNotes, setAdminNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (item) {
      setEdited({});
      setAdminNotes("");
    }
  }, [item]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
  }, []);

  if (!item || !isOpen) return null;

  const r = item as unknown as Record<string, unknown>;
  const url = String(r.official_url || r.apply_url || item.sourceUrl || item.rawUrl || "");
  const aiScore = item.verificationScore ?? item.aiConfidenceScore ?? item.aiConfidence ?? 0;
  const isApproved = item.status === "approved";
  const isRejected = item.status === "rejected";
  const isPublished = item.status === "published";
  const isPending = item.status === "pending" || item.status === "verified_ready" || item.status === "ai_processed" || item.status === "pending_verification";

  const handleSave = async () => {
    if (Object.keys(edited).length === 0) {
      showToast("error", "No changes to save");
      return;
    }
    setIsLoading(true);
    try {
      const targetId = r.collected_data_id as string || item.id;
      await onSave(targetId, edited);
      showToast("success", "Changes saved");
      setEdited({});
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Save failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      const targetId = r.collected_data_id as string || item.id;
      const hasEdits = Object.keys(edited).length > 0;
      await onApprove(targetId, adminNotes || undefined, hasEdits ? { ...edited } : undefined);
      showToast("success", hasEdits ? "Approved with latest changes" : "Item approved");
      setTimeout(() => onClose(), 500);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Approve failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = adminNotes.trim() || "Rejected by admin";
    setIsLoading(true);
    try {
      const targetId = r.collected_data_id as string || item.id;
      await onReject(targetId, reason, adminNotes || undefined);
      showToast("success", "Item rejected");
      setTimeout(() => onClose(), 500);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Reject failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    const confirmed = window.confirm("Publish this item? It will immediately be visible to users.");
    if (!confirmed) return;
    setIsLoading(true);
    try {
      const targetId = r.collected_data_id as string || item.id;
      await onPublish(targetId);
      showToast("success", "Item published");
      setTimeout(() => onClose(), 500);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Publish failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    const confirmed = window.confirm("Unpublish this item? It will go back to Approved.");
    if (!confirmed) return;
    setIsLoading(true);
    try {
      const targetId = r.collected_data_id as string || item.id;
      await onUnpublish(targetId);
      showToast("success", "Item unpublished");
      setTimeout(() => onClose(), 500);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Unpublish failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      const targetId = r.collected_data_id as string || item.id;
      await onRestore(targetId);
      showToast("success", "Item restored to Approved");
      setTimeout(() => onClose(), 500);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Restore failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Delete this item permanently? This cannot be undone.");
    if (!confirmed) return;
    setIsLoading(true);
    try {
      const targetId = r.collected_data_id as string || item.id;
      await onDelete(targetId);
      showToast("success", "Item deleted");
      setTimeout(() => onClose(), 500);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Delete failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl flex flex-col">
        {toast && (
          <div className={`absolute top-4 right-4 z-60 rounded-xl px-4 py-3 text-sm shadow-lg ${
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
          }`}>
            <div className="flex items-center gap-2">
              {toast.type === "success" ? <Check size={16} /> : <AlertTriangle size={16} />}
              {toast.message}
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1A3C6E] truncate">{item.title || "Review Item"}</h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={item.status} size="sm" />
              {(item.contentAction || item.subCategory) && (
                <span className="inline-flex items-center rounded-md bg-[#F5F3EE] px-2 py-0.5 text-[10px] font-medium text-[#1A3C6E]">
                  {item.type}/{(item.subCategory || item.contentAction || "").replace(/_/g, " ")}
                </span>
              )}
              <span className="text-xs text-[#111827]/50">ID: {item.id.slice(0, 8)}...</span>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E7EB] hover:bg-[#F5F3EE]">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* AI Review Card */}
          <div className="rounded-xl border border-[#E5E7EB] bg-slate-50 p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#111827]/60 mb-3 flex items-center gap-1.5">
              <FileText size={14} /> AI Review
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-[#1A3C6E]">{aiScore}</p>
                <p className="text-[10px] text-[#111827]/60">Verification Score</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#1A3C6E]">{item.aiConfidenceScore ?? item.aiConfidence ?? 0}</p>
                <p className="text-[10px] text-[#111827]/60">Confidence</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-[#1A3C6E]">{item.sourceTrustScore ?? 0}</p>
                <p className="text-[10px] text-[#111827]/60">Source Trust</p>
              </div>
            </div>
            {item.verificationNotes && (
              <p className="mt-2 text-xs text-[#111827]/70 bg-white rounded-lg px-3 py-2 border border-[#E5E7EB]">
                {item.verificationNotes}
              </p>
            )}
            {item.duplicateReason && (
              <p className="mt-2 text-xs text-orange-700 bg-orange-50 rounded-lg px-3 py-2 border border-orange-200">
                ⚠ Duplicate: {item.duplicateReason}
              </p>
            )}
            {item.aiNotes && (
              <details className="mt-2 group">
                <summary className="cursor-pointer text-xs font-medium text-[#111827]/60 hover:text-[#1A3C6E]">
                  AI Notes
                </summary>
                <p className="mt-1 text-xs text-[#111827]/70 bg-white rounded-lg px-3 py-2 border border-[#E5E7EB]">
                  {item.aiNotes}
                </p>
              </details>
            )}
          </div>

          {/* Dynamic Form Fields */}
          <DynamicFields item={item} edited={edited} setEdited={setEdited} isLoading={isLoading} isPublished={isPublished} />

          {/* Source + Collection Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Source</label>
              <p className="text-sm font-medium text-[#111827]">{item.sourceName || "Unknown"}</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Collection Method</label>
              <p className="text-sm font-medium text-[#111827]">{item.collectionMethod || "-"}</p>
            </div>
          </div>

          {/* Deadline */}
          {item.deadline && !edited.deadline && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">Deadline</label>
              <p className="text-sm font-medium text-[#111827]">{item.deadline}</p>
            </div>
          )}

          {/* Admin Notes */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-[#111827]/70">
              {isPending ? "Approval/Rejection Notes" : isRejected ? "Rejection Reason" : "Admin Notes"}
            </label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={2}
              placeholder={isPending ? "Add notes for approval or rejection..." : "Add admin notes..."}
              disabled={isPublished || isLoading}
              className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20 disabled:bg-slate-50"
            />
          </div>

          {/* Raw Content (collapsible) */}
          {item.rawContent && (
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-[#111827]/70 hover:text-[#1A3C6E]">
                Raw Content
              </summary>
              <div className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 px-3 py-2 text-xs text-[#111827]/70 max-h-32 overflow-y-auto">
                {item.rawContent}
              </div>
            </details>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-[#E5E7EB] px-6 py-4 space-y-2">
          {Object.keys(edited).length > 0 && (
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 transition disabled:opacity-60"
            >
              <Save size={16} />
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          )}

          <div className="flex gap-2">
            {isPending && (
              <>
                <button onClick={handleApprove} disabled={isLoading} className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition disabled:opacity-60">
                  {isLoading ? "..." : "Approve"}
                </button>
                <button onClick={handleReject} disabled={isLoading || !adminNotes.trim()} className="flex-1 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition disabled:opacity-60">
                  {isLoading ? "..." : "Reject"}
                </button>
              </>
            )}

            {isApproved && (
              <>
                <button onClick={handlePublish} disabled={isLoading} className="flex-1 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 transition disabled:opacity-60">
                  {isLoading ? "..." : "Publish"}
                </button>
                <button onClick={handleReject} disabled={isLoading} className="flex-1 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition disabled:opacity-60">
                  Reject
                </button>
              </>
            )}

            {isPublished && (
              <>
                <button onClick={handleUnpublish} disabled={isLoading} className="flex-1 rounded-lg bg-yellow-50 px-4 py-2.5 text-sm font-medium text-yellow-700 hover:bg-yellow-100 transition disabled:opacity-60">
                  {isLoading ? "..." : "Unpublish"}
                </button>
                <button onClick={handleDelete} disabled={isLoading} className="flex-1 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition disabled:opacity-60">
                  <Trash2 size={14} className="inline mr-1" />Delete
                </button>
              </>
            )}

            {isRejected && (
              <>
                <button onClick={handleRestore} disabled={isLoading} className="flex-1 rounded-lg bg-blue-50 px-4 py-2.5 text-sm font-medium text-[#1A3C6E] hover:bg-blue-100 transition disabled:opacity-60">
                  Restore
                </button>
                <button onClick={handleDelete} disabled={isLoading} className="flex-1 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-100 transition disabled:opacity-60">
                  <Trash2 size={14} className="inline mr-1" />Delete
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
