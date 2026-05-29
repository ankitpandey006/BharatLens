import type { AdminItem, AdminStats } from "@/types/admin";

const dummyItems: AdminItem[] = [
  {
    id: "ai_001",
    title: "Pradhan Mantri Scholarship Scheme 2025",
    type: "scholarship",
    category: "general",
    sourceName: "Ministry of Education",
    sourceUrl: "https://www.education.gov.in",
    summary:
      "National scholarship program for meritorious students pursuing higher education. Covers tuition fees and monthly stipends.",
    eligibility:
      "12th pass, minimum 60% marks, annual family income below 8 lakhs",
    benefits:
      "Monthly stipend of 5000 INR, tuition fee coverage up to 50000 INR",
    deadline: "2025-07-31",
    state: "National",
    status: "pending_verification",
    aiConfidenceScore: 92,
    sourceTrustScore: 98,
    aiNotes:
      "High confidence match from official gov website. Source pattern recognized from previous verified updates.",
    adminNotes: "",
    lastUpdated: "2026-05-28T08:00:00.000Z",
    publishedAt: null,
    tags: [
      "scholarship",
      "education",
      "merit-based",
      "central-scheme",
      "2025",
    ],
  },
  {
    id: "ai_002",
    title:
      "West Bengal Self Employment Scheme for SC/ST Unemployed Persons 2025",
    type: "scheme",
    category: "sc",
    sourceName: "West Bengal Govt Portal",
    sourceUrl: "https://wb.gov.in",
    summary:
      "State scheme providing loans and training for self-employment in West Bengal. Focus on SC/ST communities.",
    eligibility:
      "SC/ST category, age 18-45, unemployment certificate, West Bengal resident",
    benefits:
      "Loan up to 3 lakhs at 2% interest, free training, 25% subsidy",
    deadline: "2025-06-30",
    state: "West Bengal",
    status: "approved",
    aiConfidenceScore: 85,
    sourceTrustScore: 92,
    aiNotes:
      "Verified from official state government portal. Source trust score is high.",
    adminNotes: "Verified against 2024-25 state budget allocation. Approved for publication.",
    lastUpdated: "2026-05-23T10:00:00.000Z",
    publishedAt: "2026-05-25T10:00:00.000Z",
    tags: [
      "scheme",
      "self-employment",
      "sc/st",
      "west-bengal",
      "startup",
    ],
    matchedUsersCount: 342,
    recommendationEligible: true,
  },
  {
    id: "ai_003",
    title: "National Career Service Job Portal - Software Developer Role",
    type: "job",
    category: "general",
    sourceName: "NCS Portal",
    sourceUrl: "https://www.ncs.gov.in",
    summary:
      "Government of India job posting for software developers. Work on national e-governance projects.",
    eligibility: "Bachelor's in CS/IT, minimum 2 years experience, Indian citizen",
    benefits:
      "CTC 8-12 LPA, government benefits, skill development opportunities",
    deadline: "2025-05-15",
    state: "National",
    status: "ai_processed",
    aiConfidenceScore: 88,
    sourceTrustScore: 99,
    aiNotes:
      "Official government job portal. High trust source. Extracted from RSS feed.",
    adminNotes: "",
    lastUpdated: "2026-05-28T09:00:00.000Z",
    publishedAt: null,
    tags: ["job", "it", "government", "full-time", "delhi"],
  },
  {
    id: "ai_004",
    title: "UPSC Civil Services Examination 2025 - Notification",
    type: "exam",
    category: "general",
    sourceName: "UPSC Official Website",
    sourceUrl: "https://www.upsc.gov.in",
    summary:
      "Annual civil services examination by UPSC. Recruitment for IAS, IPS, and allied services.",
    eligibility:
      "Bachelor's degree, Indian citizen, age 21-32 (OBC +3 years, SC/ST +5 years)",
    benefits:
      "Prestigious government job, salary 56100-177500, pension, medical benefits",
    deadline: "2025-04-20",
    state: "National",
    status: "published",
    aiConfidenceScore: 99,
    sourceTrustScore: 100,
    aiNotes: "Verified official announcement. Always high confidence.",
    adminNotes: "Published. High priority exam notification.",
    lastUpdated: "2026-05-18T10:00:00.000Z",
    publishedAt: "2026-05-20T10:00:00.000Z",
    tags: ["exam", "upsc", "civil-services", "competitive", "ias", "ips"],
    matchedUsersCount: 1523,
    recommendationEligible: true,
  },
  {
    id: "ai_005",
    title: "Fake Scholarship Alert - Unverified Source",
    type: "scholarship",
    category: "general",
    sourceName: "Unknown Blog",
    sourceUrl: "https://unknown-blog.local",
    summary:
      "Unverified scholarship claiming 100% free tuition. Multiple red flags detected.",
    eligibility: "Not clearly specified",
    benefits: "Claimed 100% tuition coverage (unverified)",
    deadline: null,
    state: "Unclear",
    status: "rejected",
    aiConfidenceScore: 15,
    sourceTrustScore: 5,
    aiNotes:
      "Low confidence. Source is not recognized government/official entity. Grammar issues detected.",
    adminNotes: "Rejected - Source not verified. Likely fraudulent. Marked for exclusion.",
    lastUpdated: "2026-05-13T10:00:00.000Z",
    publishedAt: null,
    tags: ["rejected", "fraud-alert", "unverified"],
  },
  {
    id: "ai_006",
    title: "PM Awas Yojana - Affordable Housing Scheme Extended 2025",
    type: "scheme",
    category: "general",
    sourceName: "Ministry of Housing and Urban Affairs",
    sourceUrl: "https://pmawy.gov.in",
    summary:
      "Central government scheme providing affordable housing across India. Extended to 2025.",
    eligibility:
      "Income below 18 lakhs, no previous house ownership, Indian citizen",
    benefits: "Interest subsidy 4-6%, loan up to 9 lakhs, construction assistance",
    deadline: null,
    state: "National",
    status: "approved",
    aiConfidenceScore: 94,
    sourceTrustScore: 99,
    aiNotes:
      "Official ministry website. Recently updated. Scheme extension confirmed.",
    adminNotes: "Verified against official PMAY portal. Approved for general publication.",
    lastUpdated: "2026-05-28T02:00:00.000Z",
    publishedAt: "2026-05-28T06:00:00.000Z",
    tags: [
      "housing",
      "scheme",
      "central",
      "affordable-housing",
      "2025",
    ],
    matchedUsersCount: 876,
    recommendationEligible: true,
  },
  {
    id: "ai_007",
    title:
      "Tamil Nadu Dr. Ambedkar Scholarship for Scheduled Caste Students 2025",
    type: "scholarship",
    category: "sc",
    sourceName: "Tamil Nadu Government Portal",
    sourceUrl: "https://www.tn.gov.in",
    summary:
      "State scholarship for SC students pursuing higher education in Tamil Nadu.",
    eligibility: "SC category, Tamil Nadu resident, min 50% marks in 12th",
    benefits:
      "Monthly stipend 1000 INR, annual book allowance 2000 INR, exam fee waiver",
    deadline: "2025-06-15",
    state: "Tamil Nadu",
    status: "pending_verification",
    aiConfidenceScore: 87,
    sourceTrustScore: 94,
    aiNotes: "State government official portal. Consistent with previous TN schemes.",
    adminNotes: "",
    lastUpdated: "2026-05-27T22:00:00.000Z",
    publishedAt: null,
    tags: ["scholarship", "sc", "tamil-nadu", "education", "state-scheme"],
  },
  {
    id: "ai_008",
    title: "Saksham Yuva Scheme - Youth Skill Training Programme 2025",
    type: "scheme",
    category: "student",
    sourceName: "National Skill Development Council",
    sourceUrl: "https://www.nsdc.org.in",
    summary:
      "National skill development scheme offering free training in 50+ vocations for youth.",
    eligibility: "Age 18-30, 10th pass minimum, Indian citizen",
    benefits: "Free 3-month training, placement assistance, certificate, job links",
    deadline: "2025-12-31",
    state: "National",
    status: "published",
    aiConfidenceScore: 91,
    sourceTrustScore: 96,
    aiNotes:
      "Official NSDC website. Regularly updated scheme. High credibility.",
    adminNotes: "Published. Priority scheme for youth skilling.",
    lastUpdated: "2026-05-08T10:00:00.000Z",
    publishedAt: "2026-05-10T10:00:00.000Z",
    tags: ["skill", "training", "youth", "employment", "free-course"],
    matchedUsersCount: 2341,
    recommendationEligible: true,
  },
  {
    id: "ai_009",
    title: "Banking Sector Recruitment - Probationary Officer 2025",
    type: "job",
    category: "general",
    sourceName: "Indian Banking Association",
    sourceUrl: "https://www.iba.org.in",
    summary:
      "Recruitment drive for probationary officers across 20 major banks in India.",
    eligibility: "Bachelor's degree, age 21-28, Indian citizen, good health",
    benefits:
      "Salary 25000-50000 per month, pension, medical, housing benefits",
    deadline: "2025-05-31",
    state: "National",
    status: "ai_processed",
    aiConfidenceScore: 86,
    sourceTrustScore: 93,
    aiNotes: "Verified banking sector announcement. Recently published.",
    adminNotes: "",
    lastUpdated: "2026-05-28T07:00:00.000Z",
    publishedAt: null,
    tags: ["job", "banking", "po", "finance", "full-time"],
  },
  {
    id: "ai_010",
    title: "Pradhan Mantri MUDRA Loan Scheme - Update 2025",
    type: "scheme",
    category: "general",
    sourceName: "MUDRA Portal",
    sourceUrl: "https://www.mudra.org.in",
    summary:
      "Micro Units Development & Refinance Agency - loans for micro enterprises.",
    eligibility:
      "Age 18+, Indian citizen, business plan, no security required",
    benefits:
      "Loan up to 10 lakhs, 7.5-9% interest, 5-7 year tenure, government guarantee",
    deadline: null,
    state: "National",
    status: "pending_verification",
    aiConfidenceScore: 90,
    sourceTrustScore: 97,
    aiNotes:
      "Official MUDRA website. 2025 update confirmed. Source trust very high.",
    adminNotes: "",
    lastUpdated: "2026-05-28T04:00:00.000Z",
    publishedAt: null,
    tags: ["loan", "mudra", "business", "startup", "entrepreneurship"],
  },
];

export function getDummyAdminItems(): AdminItem[] {
  return JSON.parse(JSON.stringify(dummyItems));
}

export function getDummyAdminStats(): AdminStats {
  const items = dummyItems;
  return {
    totalAiItems: items.length,
    pendingVerification: items.filter((i) => i.status === "pending_verification")
      .length,
    approved: items.filter((i) => i.status === "approved").length,
    rejected: items.filter((i) => i.status === "rejected").length,
    published: items.filter((i) => i.status === "published").length,
    highPriorityAlerts: items.filter(
      (i) =>
        i.status === "pending_verification" && i.aiConfidenceScore > 85
    ).length,
  };
}

export function filterAdminItems(
  items: AdminItem[],
  filters: {
    search?: string;
    type?: string;
    status?: string;
    state?: string;
    source?: string;
  }
): AdminItem[] {
  return items.filter((item) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (
        !item.title.toLowerCase().includes(search) &&
        !item.summary.toLowerCase().includes(search) &&
        !item.sourceName.toLowerCase().includes(search)
      ) {
        return false;
      }
    }

    if (filters.type && filters.type !== "all" && item.type !== filters.type) {
      return false;
    }

    if (
      filters.status &&
      filters.status !== "all" &&
      item.status !== filters.status
    ) {
      return false;
    }

    if (filters.state && filters.state !== "all" && item.state !== filters.state) {
      return false;
    }

    if (
      filters.source &&
      filters.source !== "all" &&
      !item.sourceName.toLowerCase().includes(filters.source.toLowerCase())
    ) {
      return false;
    }

    return true;
  });
}

export function sortAdminItems(
  items: AdminItem[],
  sortBy: "confidence" | "trust" | "latest" | "deadline",
  sortOrder: "asc" | "desc"
): AdminItem[] {
  const sorted = [...items].sort((a, b) => {
    let compareValue = 0;

    switch (sortBy) {
      case "confidence":
        compareValue = a.aiConfidenceScore - b.aiConfidenceScore;
        break;
      case "trust":
        compareValue = a.sourceTrustScore - b.sourceTrustScore;
        break;
      case "latest":
        compareValue = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
        break;
      case "deadline":
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        compareValue = new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        break;
    }

    return sortOrder === "asc" ? compareValue : -compareValue;
  });

  return sorted;
}
