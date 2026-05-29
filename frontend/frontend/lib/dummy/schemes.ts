import type { VerificationStatus } from "./verifiedSources";

export type SchemeLifecycleStatus = "active" | "closed" | "upcoming";

export interface Scheme {
  id: string;
  title: string;
  description: string;
  state: string;
  category: string;
  status: SchemeLifecycleStatus;
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

const schemeSeeds: Array<Omit<Scheme, "id" | "created_at" | "updated_at">> = [
  { title: "PM Kisan Samman Nidhi", description: "Income support for small and marginal farmers through direct benefit transfer.", state: "All India", category: "farmer", status: "active", deadline: "2026-06-30", official_url: "https://pmkisan.gov.in", source_id: "source-pmkisan", verification_status: "approved", approved_by: approver },
  { title: "PM Fasal Bima Yojana", description: "Crop insurance support for weather and yield loss.", state: "All India", category: "farmer", status: "active", deadline: "2026-07-15", official_url: "https://pmfby.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Kisan Credit Card Extension Drive", description: "Credit access for agriculture and allied activities.", state: "All India", category: "farmer", status: "upcoming", deadline: "2026-08-20", official_url: "https://www.myscheme.gov.in", source_id: "source-myscheme", verification_status: "pending", approved_by: null },
  { title: "Soil Health Card Scheme", description: "Free soil testing and nutrient advisory for farmers.", state: "All India", category: "farmer", status: "active", deadline: "2026-09-10", official_url: "https://soilhealth.dac.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Rajasthan Mukhyamantri Kisan Mitra Yojana", description: "Electricity subsidy for agricultural consumers in Rajasthan.", state: "Rajasthan", category: "farmer", status: "active", deadline: "2026-06-25", official_url: "https://rajasthan.gov.in", source_id: "source-rpsc", verification_status: "approved", approved_by: approver },
  { title: "Maharashtra Krushi Pump Yojana", description: "Assistance for solar and electric irrigation pumps.", state: "Maharashtra", category: "farmer", status: "active", deadline: "2026-07-30", official_url: "https://mahadbt.maharashtra.gov.in", source_id: "source-maha-gov", verification_status: "approved", approved_by: approver },
  { title: "UP Kisan Uday Yojana", description: "Support for high-efficiency pump distribution and farm productivity.", state: "Uttar Pradesh", category: "farmer", status: "upcoming", deadline: "2026-10-01", official_url: "https://up.gov.in", source_id: "source-uppsc", verification_status: "pending", approved_by: null },
  { title: "Pradhan Mantri Matru Vandana Yojana", description: "Maternity benefit support for pregnant and lactating women.", state: "All India", category: "women", status: "active", deadline: "2026-12-31", official_url: "https://wcd.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Mahila Samman Savings Certificate", description: "Small savings scheme with fixed return for women investors.", state: "All India", category: "women", status: "active", deadline: "2026-09-30", official_url: "https://www.indiapost.gov.in", source_id: "source-pib", verification_status: "approved", approved_by: approver },
  { title: "Stand-Up India for Women Entrepreneurs", description: "Bank loans for women-led greenfield enterprises.", state: "All India", category: "startup", status: "active", deadline: "2026-11-30", official_url: "https://www.standupmitra.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Tamil Nadu Women Livelihood Mission", description: "Livelihood and credit support for women self-help groups.", state: "Tamil Nadu", category: "women", status: "active", deadline: "2026-08-15", official_url: "https://www.tn.gov.in", source_id: "source-tn-gov", verification_status: "approved", approved_by: approver },
  { title: "Bihar Mukhyamantri Kanya Utthan Yojana", description: "Financial support for girl students at key education milestones.", state: "Bihar", category: "women", status: "active", deadline: "2026-07-05", official_url: "https://state.bihar.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "One District One Product Startup Support", description: "Startup grants and mentorship for district-led product innovation.", state: "Uttar Pradesh", category: "startup", status: "upcoming", deadline: "2026-10-20", official_url: "https://up.gov.in", source_id: "source-uppsc", verification_status: "pending", approved_by: null },
  { title: "Startup India Seed Fund Scheme", description: "Early-stage seed capital assistance for DPIIT-recognized startups.", state: "All India", category: "startup", status: "active", deadline: "2026-11-12", official_url: "https://www.startupindia.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Madhya Pradesh MSME Innovation Grant", description: "Support for technology adoption in small manufacturing units.", state: "Madhya Pradesh", category: "startup", status: "active", deadline: "2026-09-01", official_url: "https://mp.gov.in", source_id: "source-mppsc", verification_status: "approved", approved_by: approver },
  { title: "National Apprenticeship Promotion Scheme", description: "Stipend and employer support for youth apprenticeship training.", state: "All India", category: "youth", status: "active", deadline: "2026-12-01", official_url: "https://www.apprenticeshipindia.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "PMEGP Credit Linked Subsidy", description: "Subsidized loans for rural and urban micro enterprises.", state: "All India", category: "startup", status: "active", deadline: "2026-08-31", official_url: "https://www.kviconline.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Deen Dayal Upadhyaya Grameen Kaushalya Yojana", description: "Skill development and placement support in rural areas.", state: "All India", category: "youth", status: "active", deadline: "2026-09-25", official_url: "https://ddugky.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Assam Rural Youth Skill Program", description: "State-funded residential skill training for unemployed youth.", state: "Assam", category: "youth", status: "upcoming", deadline: "2026-10-05", official_url: "https://assam.gov.in", source_id: "source-data-gov", verification_status: "pending", approved_by: null },
  { title: "Ladakh Tourism Youth Enterprise Support", description: "Subsidized credit and training for tourism-linked startups.", state: "Ladakh", category: "startup", status: "active", deadline: "2026-08-10", official_url: "https://ladakh.nic.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "PM Awas Yojana Gramin", description: "Housing support for rural households through phased installments.", state: "All India", category: "housing", status: "active", deadline: "2026-12-31", official_url: "https://pmayg.nic.in", source_id: "source-myscheme", verification_status: "approved", approved_by: approver },
  { title: "PM Awas Yojana Urban", description: "Urban housing subsidy under credit linked and beneficiary-led components.", state: "All India", category: "housing", status: "active", deadline: "2026-12-31", official_url: "https://pmaymis.gov.in", source_id: "source-myscheme", verification_status: "approved", approved_by: approver },
  { title: "Ayushman Bharat PM-JAY", description: "Health insurance cover for eligible low-income households.", state: "All India", category: "health", status: "active", deadline: "2026-12-31", official_url: "https://pmjay.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "National Health Mission Mobile Medical Unit Grant", description: "Support for primary care delivery in underserved districts.", state: "All India", category: "health", status: "active", deadline: "2026-09-30", official_url: "https://nhm.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Janani Suraksha Yojana", description: "Incentive-based maternal health intervention to reduce mortality.", state: "All India", category: "health", status: "active", deadline: "2026-11-05", official_url: "https://nhm.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "National Means Cum Merit Support Extension", description: "State-linked top-up support for meritorious school children.", state: "All India", category: "education", status: "upcoming", deadline: "2026-09-15", official_url: "https://www.education.gov.in", source_id: "source-data-gov", verification_status: "pending", approved_by: null },
  { title: "PM YASASVI Scholarship Scheme", description: "Scholarship support for OBC, EBC and DNT school students.", state: "All India", category: "education", status: "active", deadline: "2026-07-20", official_url: "https://yet.nta.ac.in", source_id: "source-nta", verification_status: "approved", approved_by: approver },
  { title: "West Bengal Student Credit Card Interest Subsidy", description: "Interest relief for eligible students availing education loans.", state: "West Bengal", category: "education", status: "active", deadline: "2026-08-05", official_url: "https://wbscc.wb.gov.in", source_id: "source-wbjee", verification_status: "approved", approved_by: approver },
  { title: "Odisha Higher Education Assistance", description: "Fee reimbursement for low-income students in state institutions.", state: "Odisha", category: "education", status: "active", deadline: "2026-07-12", official_url: "https://odisha.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Delhi e-District Disability Support Scheme", description: "Assistive support and direct grant for persons with disabilities.", state: "Delhi", category: "social_welfare", status: "active", deadline: "2026-10-25", official_url: "https://edistrict.delhigovt.nic.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "PM SVANidhi Vendor Credit", description: "Working capital loan scheme for street vendors.", state: "All India", category: "livelihood", status: "active", deadline: "2026-11-15", official_url: "https://pmsvanidhi.mohua.gov.in", source_id: "source-myscheme", verification_status: "approved", approved_by: approver },
  { title: "National Livelihood Mission SHG Credit Linkage", description: "Credit support for women self-help groups and federations.", state: "All India", category: "livelihood", status: "active", deadline: "2026-08-31", official_url: "https://aajeevika.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Tripura Tribal Livelihood Strengthening Program", description: "Income generation support for tribal households.", state: "Tripura", category: "social_welfare", status: "upcoming", deadline: "2026-10-10", official_url: "https://tripura.gov.in", source_id: "source-data-gov", verification_status: "pending", approved_by: null },
  { title: "Kerala Women Coir Entrepreneur Package", description: "Machine subsidy and training for women-led coir units.", state: "Kerala", category: "women", status: "active", deadline: "2026-09-20", official_url: "https://kerala.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Chhattisgarh Forest Produce Value Addition Scheme", description: "Support for tribal producer groups and value chain upgrades.", state: "Chhattisgarh", category: "farmer", status: "active", deadline: "2026-08-18", official_url: "https://cgstate.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "National Clean Energy Startup Challenge", description: "Grant for early-stage clean technology and battery startups.", state: "All India", category: "startup", status: "upcoming", deadline: "2026-11-22", official_url: "https://www.startupindia.gov.in", source_id: "source-data-gov", verification_status: "pending", approved_by: null },
  { title: "PM Vishwakarma Skill and Toolkit Support", description: "Toolkit incentive and skilling support for traditional artisans.", state: "All India", category: "livelihood", status: "active", deadline: "2026-10-31", official_url: "https://pmvishwakarma.gov.in", source_id: "source-myscheme", verification_status: "approved", approved_by: approver },
  { title: "National Fisheries Development Subsidy", description: "Support for inland fisheries infrastructure and seeds.", state: "All India", category: "farmer", status: "active", deadline: "2026-09-08", official_url: "https://dof.gov.in", source_id: "source-data-gov", verification_status: "approved", approved_by: approver },
  { title: "Andhra Women MSME Acceleration Program", description: "Capital subsidy for women-led manufacturing units.", state: "Andhra Pradesh", category: "women", status: "upcoming", deadline: "2026-10-28", official_url: "https://ap.gov.in", source_id: "source-data-gov", verification_status: "pending", approved_by: null },
  { title: "UP Minority Girl Child Education Grant", description: "Direct benefit for minority girls continuing secondary education.", state: "Uttar Pradesh", category: "education", status: "closed", deadline: "2026-03-31", official_url: "https://minoritywelfare.up.gov.in", source_id: "source-uppsc", verification_status: "approved", approved_by: approver },
];

export const schemes: Scheme[] = schemeSeeds.map((seed, index) => ({
  id: `scheme-${String(index + 1).padStart(2, "0")}`,
  ...seed,
  created_at: now,
  updated_at: now,
}));

export const filterSchemes = (params: { state?: string; category?: string; status?: SchemeLifecycleStatus }): Scheme[] =>
  schemes.filter((scheme) => {
    const stateOk = !params.state || params.state === "All" || scheme.state === params.state || scheme.state === "All India";
    const categoryOk = !params.category || params.category === "All" || scheme.category === params.category;
    const statusOk = !params.status || scheme.status === params.status;
    return stateOk && categoryOk && statusOk;
  });

export const searchSchemes = (query: string): Scheme[] => {
  const term = query.trim().toLowerCase();
  if (!term) return schemes;
  return schemes.filter((scheme) => `${scheme.title} ${scheme.description} ${scheme.category}`.toLowerCase().includes(term));
};
