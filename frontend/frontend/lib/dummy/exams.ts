import type { VerificationStatus } from "./verifiedSources";

export type ExamStatus = "active" | "closed" | "upcoming";

export interface GovernmentExam {
  id: string;
  title: string;
  description: string;
  conducting_body: string;
  category: string;
  state: string;
  application_deadline: string;
  exam_date: string;
  notification_date: string;
  admit_card_date: string;
  result_date: string;
  status: ExamStatus;
  official_url: string;
  source_id: string;
  verification_status: VerificationStatus | "rejected";
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";
const approver = "Ananya Srivastava";

const examSeeds = [
  { title: "UPSC Civil Services Examination", conducting_body: "UPSC", category: "UPSC", state: "All India", source_id: "source-upsc" },
  { title: "SSC Combined Graduate Level", conducting_body: "SSC", category: "SSC", state: "All India", source_id: "source-ssc" },
  { title: "JEE Main", conducting_body: "NTA", category: "Engineering", state: "All India", source_id: "source-nta" },
  { title: "NEET UG", conducting_body: "NTA", category: "Medical", state: "All India", source_id: "source-nta" },
  { title: "WBJEE", conducting_body: "WBJEE Board", category: "Engineering", state: "West Bengal", source_id: "source-wbjee" },
  { title: "CAT", conducting_body: "IIM Consortium", category: "Management", state: "All India", source_id: "source-data-gov" },
  { title: "GATE", conducting_body: "IIT Organizing Institute", category: "Engineering", state: "All India", source_id: "source-data-gov" },
  { title: "RPSC RAS Pre", conducting_body: "RPSC", category: "State PSC", state: "Rajasthan", source_id: "source-rpsc" },
  { title: "MPPSC State Services Prelims", conducting_body: "MPPSC", category: "State PSC", state: "Madhya Pradesh", source_id: "source-mppsc" },
  { title: "UPPSC PCS Prelims", conducting_body: "UPPSC", category: "State PSC", state: "Uttar Pradesh", source_id: "source-uppsc" },
];

export const exams: GovernmentExam[] = Array.from({ length: 30 }, (_, index) => {
  const seed = examSeeds[index % examSeeds.length];
  const status: ExamStatus = index % 11 === 0 ? "closed" : index % 4 === 0 ? "upcoming" : "active";
  const verification_status: GovernmentExam["verification_status"] =
    status === "closed" && index % 22 === 0 ? "rejected" : status === "upcoming" ? "pending" : "approved";
  const month = (index % 6) + 6;
  const wrapMonth = (value: number): string => String(((value - 1) % 12) + 1).padStart(2, "0");
  const date = (index % 18) + 8;

  return {
    id: `exam-${String(index + 1).padStart(2, "0")}`,
    title: `${seed.title} ${index >= 10 ? `(Session ${Math.floor(index / 10) + 1})` : ""}`.trim(),
    description: `${seed.title} examination announcement with complete schedule, eligibility norms, and reservation criteria.`,
    conducting_body: seed.conducting_body,
    category: seed.category,
    state: seed.state,
    application_deadline: `2026-${wrapMonth(month)}-${String(date).padStart(2, "0")}`,
    exam_date: `2026-${wrapMonth(month + 1)}-${String((date + 5) % 28 || 1).padStart(2, "0")}`,
    notification_date: `2026-${wrapMonth(month - 1)}-${String((date + 2) % 28 || 1).padStart(2, "0")}`,
    admit_card_date: `2026-${wrapMonth(month + 1)}-${String((date + 1) % 28 || 1).padStart(2, "0")}`,
    result_date: `2026-${wrapMonth(month + 2)}-${String((date + 12) % 28 || 1).padStart(2, "0")}`,
    status,
    official_url: `https://exam.bharatlens.in/${String(index + 1).padStart(2, "0")}`,
    source_id: seed.source_id,
    verification_status,
    approved_by: verification_status === "approved" ? approver : null,
    created_at: now,
    updated_at: now,
  };
});

export const getUpcomingExams = (): GovernmentExam[] => exams.filter((exam) => exam.status === "upcoming");
