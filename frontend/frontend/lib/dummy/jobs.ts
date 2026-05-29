import type { VerificationStatus } from "./verifiedSources";

export type JobStatus = "active" | "closed" | "upcoming";

export interface GovernmentJob {
  id: string;
  title: string;
  description: string;
  department: string;
  state: string;
  qualification: string;
  category: string;
  vacancies: number;
  deadline: string;
  status: JobStatus;
  official_url: string;
  source_id: string;
  verification_status: VerificationStatus | "rejected";
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";
const approver = "Ananya Srivastava";

const jobTemplates = [
  { title: "SSC CGL Assistant Section Officer", department: "Staff Selection Commission", category: "SSC", qualification: "graduate", source_id: "source-ssc" },
  { title: "Railway NTPC Junior Clerk", department: "Indian Railways", category: "Railways", qualification: "class_12", source_id: "source-data-gov" },
  { title: "IBPS Clerk", department: "Public Sector Banks", category: "Banking", qualification: "graduate", source_id: "source-ibps" },
  { title: "UPPSC Review Officer", department: "Uttar Pradesh Public Service Commission", category: "State PSC", qualification: "graduate", source_id: "source-uppsc" },
  { title: "RPSC School Lecturer", department: "Rajasthan Education Department", category: "Teaching", qualification: "postgraduate", source_id: "source-rpsc" },
  { title: "State Police Sub Inspector", department: "Home Department", category: "Police", qualification: "graduate", source_id: "source-data-gov" },
  { title: "Indian Army Technical Entry", department: "Ministry of Defence", category: "Defence", qualification: "diploma", source_id: "source-pib" },
  { title: "SSC CHSL Data Entry Operator", department: "Staff Selection Commission", category: "SSC", qualification: "class_12", source_id: "source-ssc" },
  { title: "Railway Group D Track Maintainer", department: "Indian Railways", category: "Railways", qualification: "class_10", source_id: "source-data-gov" },
  { title: "SBI Probationary Officer", department: "State Bank of India", category: "Banking", qualification: "graduate", source_id: "source-ibps" },
];

const states = ["All India", "Uttar Pradesh", "Rajasthan", "Madhya Pradesh", "Maharashtra", "West Bengal", "Tamil Nadu", "Bihar"];

export const jobs: GovernmentJob[] = Array.from({ length: 40 }, (_, index) => {
  const template = jobTemplates[index % jobTemplates.length];
  const status: JobStatus = index % 10 === 0 ? "closed" : index % 4 === 0 ? "upcoming" : "active";
  const verification_status: GovernmentJob["verification_status"] =
    status === "closed" && index % 20 === 0 ? "rejected" : status === "upcoming" ? "pending" : "approved";

  return {
    id: `job-${String(index + 1).padStart(2, "0")}`,
    title: `${template.title} ${index >= 10 ? `(Cycle ${Math.floor(index / 10) + 1})` : ""}`.trim(),
    description: `Recruitment for ${template.category} category with transparent selection, reservation norms, and online application.`,
    department: template.department,
    state: states[index % states.length],
    qualification: template.qualification,
    category: template.category,
    vacancies: 120 + (index % 7) * 55,
    deadline: `2026-${String((index % 6) + 6).padStart(2, "0")}-${String((index % 18) + 10).padStart(2, "0")}`,
    status,
    official_url: `https://jobs.gov.in/listing/${String(index + 1).padStart(2, "0")}`,
    source_id: template.source_id,
    verification_status,
    approved_by: verification_status === "approved" ? approver : null,
    created_at: now,
    updated_at: now,
  };
});

export const filterJobsByCategory = (category: string): GovernmentJob[] =>
  jobs.filter((job) => category === "All" || job.category === category);
