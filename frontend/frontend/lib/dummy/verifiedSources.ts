export type SourceType = "portal" | "ministry" | "commission" | "board" | "state_portal" | "agency";
export type VerificationStatus = "active" | "approved" | "pending";

export interface VerifiedSource {
  id: string;
  source_name: string;
  source_url: string;
  source_type: SourceType;
  trust_score: number;
  status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";

export const verifiedSources: VerifiedSource[] = [
  { id: "source-nsp", source_name: "National Scholarship Portal", source_url: "https://scholarships.gov.in", source_type: "portal", trust_score: 99, status: "approved", created_at: now, updated_at: now },
  { id: "source-data-gov", source_name: "Data.gov.in", source_url: "https://data.gov.in", source_type: "portal", trust_score: 98, status: "approved", created_at: now, updated_at: now },
  { id: "source-pib", source_name: "Press Information Bureau", source_url: "https://pib.gov.in", source_type: "agency", trust_score: 97, status: "approved", created_at: now, updated_at: now },
  { id: "source-upsc", source_name: "UPSC", source_url: "https://upsc.gov.in", source_type: "commission", trust_score: 99, status: "approved", created_at: now, updated_at: now },
  { id: "source-ssc", source_name: "Staff Selection Commission", source_url: "https://ssc.gov.in", source_type: "commission", trust_score: 98, status: "approved", created_at: now, updated_at: now },
  { id: "source-nta", source_name: "National Testing Agency", source_url: "https://nta.ac.in", source_type: "board", trust_score: 97, status: "approved", created_at: now, updated_at: now },
  { id: "source-pmkisan", source_name: "PM-KISAN", source_url: "https://pmkisan.gov.in", source_type: "portal", trust_score: 98, status: "approved", created_at: now, updated_at: now },
  { id: "source-aicte", source_name: "AICTE", source_url: "https://aicte-india.org", source_type: "board", trust_score: 96, status: "approved", created_at: now, updated_at: now },
  { id: "source-ugc", source_name: "UGC", source_url: "https://ugc.gov.in", source_type: "board", trust_score: 96, status: "approved", created_at: now, updated_at: now },
  { id: "source-myscheme", source_name: "MyScheme", source_url: "https://www.myscheme.gov.in", source_type: "portal", trust_score: 97, status: "approved", created_at: now, updated_at: now },
  { id: "source-rpsc", source_name: "Rajasthan Public Service Commission", source_url: "https://rpsc.rajasthan.gov.in", source_type: "state_portal", trust_score: 95, status: "active", created_at: now, updated_at: now },
  { id: "source-mppsc", source_name: "Madhya Pradesh Public Service Commission", source_url: "https://mppsc.mp.gov.in", source_type: "state_portal", trust_score: 94, status: "active", created_at: now, updated_at: now },
  { id: "source-uppsc", source_name: "Uttar Pradesh Public Service Commission", source_url: "https://uppsc.up.nic.in", source_type: "state_portal", trust_score: 95, status: "active", created_at: now, updated_at: now },
  { id: "source-wbjee", source_name: "WBJEE Board", source_url: "https://wbjeeb.nic.in", source_type: "state_portal", trust_score: 94, status: "active", created_at: now, updated_at: now },
  { id: "source-tn-gov", source_name: "Tamil Nadu e-Governance Portal", source_url: "https://www.tn.gov.in", source_type: "state_portal", trust_score: 93, status: "active", created_at: now, updated_at: now },
  { id: "source-maha-gov", source_name: "Maharashtra MahaDBT", source_url: "https://mahadbt.maharashtra.gov.in", source_type: "state_portal", trust_score: 96, status: "approved", created_at: now, updated_at: now },
  { id: "source-ibps", source_name: "Institute of Banking Personnel Selection", source_url: "https://ibps.in", source_type: "agency", trust_score: 95, status: "approved", created_at: now, updated_at: now },
];

export const getHighTrustSources = (minimumScore = 96): VerifiedSource[] =>
  verifiedSources.filter((source) => source.trust_score >= minimumScore);
