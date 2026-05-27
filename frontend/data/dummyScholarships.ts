import type { ScholarshipListItem } from "@/types";

export const dummyScholarships: ScholarshipListItem[] = [
  {
    id: "scholarship-1",
    title: "National Scholarship for Higher Education",
    provider: "Ministry of Education",
    category: "Undergraduate",
    eligibility: "Students with family income below INR 4.5 lakh per annum",
    amount: "Up to INR 75,000",
    deadline: "2026-07-15",
    status: "Open",
    description:
      "Merit based scholarship for students entering recognized colleges and universities across India.",
  },
  {
    id: "scholarship-2",
    title: "Post Matric Scholarship for SC Students",
    provider: "Department of Social Justice",
    category: "Postgraduate",
    eligibility: "SC students in recognized post-matric or post-secondary courses",
    amount: "Tuition reimbursement plus maintenance allowance",
    deadline: "2026-06-25",
    status: "Closing Soon",
    description:
      "Supports continuation of higher studies for SC students with course fees and maintenance grants.",
  },
  {
    id: "scholarship-3",
    title: "Pragati Scholarship for Girl Students",
    provider: "AICTE",
    category: "Technical",
    eligibility: "Girl students in first year AICTE approved diploma or degree programs",
    amount: "INR 50,000 per year",
    deadline: "2026-08-30",
    status: "Upcoming",
    description:
      "Encourages female participation in technical education through annual financial assistance.",
  },
  {
    id: "scholarship-4",
    title: "Inspire Scholarship",
    provider: "Department of Science and Technology",
    category: "Science",
    eligibility: "Top science students pursuing natural and basic sciences",
    amount: "INR 80,000 per year",
    deadline: "2026-05-10",
    status: "Closed",
    description:
      "Scholarship to attract talented students into science research and long-term innovation careers.",
  },
];
