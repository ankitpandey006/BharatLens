export interface SchemeItem {
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

const schemes: SchemeItem[] = [
  {
    id: "scheme-001",
    title: "Student Scholarship for Rural Education",
    description: "Support for rural students pursuing higher education with scholarship funding.",
    category: "Education",
    provider: "Ministry of Education",
    benefit: "Up to ₹25,000 per year",
    eligibility: "Students from rural districts with family income below ₹2 lakh",
    deadline: "2026-08-15",
    status: "Open",
  },
  {
    id: "scheme-002",
    title: "Women Entrepreneurship Grant",
    description: "Funding and mentoring support for women-led startups in tier 2 and tier 3 cities.",
    category: "Women Empowerment",
    provider: "MSME",
    benefit: "Grant up to ₹10 lakh",
    eligibility: "Women entrepreneurs with business plan and registration",
    deadline: "2026-07-31",
    status: "Closing Soon",
  },
  {
    id: "scheme-003",
    title: "Urban Housing Subsidy",
    description: "Subsidies for affordable housing development in metropolitan regions.",
    category: "Housing",
    provider: "Housing Board",
    benefit: "Interest subsidy up to 6%",
    eligibility: "Urban families with annual income below ₹6 lakh",
    deadline: "2026-09-20",
    status: "Open",
  },
];

export function getAllSchemes(): SchemeItem[] {
  return schemes;
}

export function getSchemeById(id: string): SchemeItem | undefined {
  return schemes.find((scheme) => scheme.id === id);
}
