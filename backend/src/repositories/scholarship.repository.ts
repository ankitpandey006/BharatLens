export interface ScholarshipItem {
  id: string;
  title: string;
  description: string;
  category: string;
  provider: string;
  benefit: string;
  eligibility: string;
  deadline: string;
  status: string;
}

const scholarships: ScholarshipItem[] = [
  {
    id: "scholarship-001",
    title: "National Merit Scholarship",
    description: "Financial support for meritorious students in secondary and higher secondary education.",
    category: "Education",
    provider: "Scholarship Board",
    benefit: "₹20,000 per year",
    eligibility: "Top performers in Class 10 and Class 12 board exams",
    deadline: "2026-09-01",
    status: "Open",
  },
  {
    id: "scholarship-002",
    title: "Minority Support Scholarship",
    description: "Scholarship for minority community students pursuing technical degrees.",
    category: "Minority Welfare",
    provider: "Social Justice Department",
    benefit: "₹15,000 per year",
    eligibility: "Minority students enrolled in accredited institutes",
    deadline: "2026-08-10",
    status: "Closing Soon",
  },
];

export function getAllScholarships(): ScholarshipItem[] {
  return scholarships;
}

export function getScholarshipById(id: string): ScholarshipItem | undefined {
  return scholarships.find((scholarship) => scholarship.id === id);
}
