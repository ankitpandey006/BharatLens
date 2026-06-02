import type { VerificationStatus } from "./verifiedSources";

export type ScholarshipStatus = "active" | "closed" | "upcoming";

export interface Scholarship {
  id: string;
  title: string;
  description: string;
  state: string;
  category: string;
  amount: string;
  status: ScholarshipStatus;
  deadline: string;
  official_url: string;
  source_id: string;
  verification_status: VerificationStatus | "rejected";
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";
const approver = "Ananya Srivastava";

const states = ["All India", "Uttar Pradesh", "Bihar", "West Bengal", "Maharashtra", "Tamil Nadu", "Rajasthan", "Assam"];
const categories = ["minority", "merit", "engineering", "girl_child", "state", "research", "post_matric", "medical"];
const sourceByCategory: Record<string, string> = {
  minority: "source-nsp",
  merit: "source-nsp",
  engineering: "source-aicte",
  girl_child: "source-nsp",
  state: "source-data-gov",
  research: "source-ugc",
  post_matric: "source-nsp",
  medical: "source-nta",
};

const titles = [
  "National Merit Cum Means Scholarship",
  "Post Matric Scholarship for SC Students",
  "Post Matric Scholarship for ST Students",
  "Begum Hazrat Mahal Scholarship",
  "AICTE Pragati Scholarship for Girls",
  "AICTE Saksham Scholarship",
  "UGC Ishan Uday Scholarship",
  "INSPIRE Scholarship for Science",
  "Maulana Azad National Fellowship",
  "Central Sector Scholarship for College Students",
  "Rajasthan Mukhyamantri Uch Shiksha Scholarship",
  "UP Dashmottar Scholarship",
  "Bihar Chief Minister Girls Scholarship",
  "West Bengal Swami Vivekananda Scholarship",
  "Maharashtra Rajarshi Shahu Scholarship",
  "Tamil Nadu First Graduate Scholarship",
  "Assam Minority Merit Scholarship",
  "NMMSS Topper Incentive",
  "National Fellowship for OBC Students",
  "Prime Minister Scholarship for RPF Wards",
  "KVPY Legacy Research Grant",
  "National Scholarship for Single Girl Child",
  "Engineering Talent Support Scholarship",
  "Rural Girl Child STEM Scholarship",
  "Medical Entrance Preparation Scholarship",
  "State Merit Scholarship for Undergraduate Women",
  "Hostel Assistance Scholarship for SC Girls",
  "Northeast Graduate Support Scholarship",
  "Farmer Family Student Scholarship",
  "Divyang Student Higher Education Scholarship",
  "Women in Technology Scholarship",
  "Minority Professional Course Scholarship",
  "Postgraduate Research Grant for Social Sciences",
  "Polytechnic Excellence Scholarship",
  "Nursing Student Support Scholarship",
  "Tribal Talent Scholarship",
  "UPSC Aspirant Support Scholarship",
  "Banking Exam Preparation Scholarship",
  "Defence Children Merit Scholarship",
  "National Digital Learning Scholarship",
];

export const scholarships: Scholarship[] = titles.map((title, index) => {
  const category = categories[index % categories.length];
  const state = states[index % states.length];
  const status: ScholarshipStatus = index % 9 === 0 ? "closed" : index % 5 === 0 ? "upcoming" : "active";
  const verification_status: Scholarship["verification_status"] =
    status === "closed" && index % 18 === 0 ? "rejected" : status === "upcoming" ? "pending" : "approved";

  return {
    id: `scholarship-${String(index + 1).padStart(2, "0")}`,
    title,
    description: `${title} supports eligible candidates with fee reimbursement or direct education assistance.`,
    state,
    category,
    amount: category === "engineering" || category === "medical" ? "INR 75,000 per year" : "INR 25,000 to INR 60,000 per year",
    status,
    deadline: `2026-${String((index % 6) + 6).padStart(2, "0")}-${String((index % 20) + 8).padStart(2, "0")}`,
    official_url: `https://scholarships.gov.in/${String(index + 1).padStart(2, "0")}`,
    source_id: sourceByCategory[category],
    verification_status,
    approved_by: verification_status === "approved" ? approver : null,
    created_at: now,
    updated_at: now,
  };
});

export const filterScholarshipsByStateCategory = (state: string, category: string): Scholarship[] =>
  scholarships.filter(
    (item) => (state === "All" || item.state === "All India" || item.state === state) && (category === "All" || item.category === category)
  );
