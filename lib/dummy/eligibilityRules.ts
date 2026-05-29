import { exams } from "./exams";
import { jobs } from "./jobs";
import { scholarships } from "./scholarships";
import { schemes } from "./schemes";
import type { EducationLevel, IncomeRange, SocialCategory, UserType } from "./userProfiles";

export type EligibilityEntityType = "scheme" | "scholarship" | "job" | "exam";

export interface EligibilityRule {
  id: string;
  entity_type: EligibilityEntityType;
  entity_id: string;
  min_age: number;
  max_age: number;
  income_range: IncomeRange[];
  category: SocialCategory[];
  education_level: EducationLevel[];
  occupation: string[];
  user_type: UserType[];
  gender: Array<"male" | "female" | "other" | "all">;
  state_scope: string[];
  status: "active" | "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";

const buildRules = <T extends { id: string; category?: string; state?: string }>(
  items: T[],
  entity_type: EligibilityEntityType,
  ageRange: [number, number],
  userTypes: UserType[],
  status: EligibilityRule["status"]
): EligibilityRule[] =>
  items.map((item, index) => ({
    id: `rule-${entity_type}-${String(index + 1).padStart(2, "0")}`,
    entity_type,
    entity_id: item.id,
    min_age: ageRange[0],
    max_age: ageRange[1],
    income_range: index % 3 === 0 ? ["below_2_lakh", "2_to_5_lakh"] : ["below_2_lakh", "2_to_5_lakh", "5_to_8_lakh"],
    category: index % 5 === 0 ? ["SC", "ST", "OBC"] : ["SC", "ST", "OBC", "General", "EWS"],
    education_level:
      entity_type === "job"
        ? ["class_10", "class_12", "diploma", "graduate", "postgraduate"]
        : entity_type === "exam"
        ? ["class_12", "graduate", "postgraduate"]
        : ["class_10", "class_12", "diploma", "graduate", "postgraduate", "phd"],
    occupation: entity_type === "scheme" ? ["farmer", "student", "self employed", "unemployed"] : ["student", "aspirant", "working professional"],
    user_type: userTypes,
    gender: item.category === "women" || item.category === "girl_child" ? ["female"] : ["all"],
    state_scope: item.state ? [item.state] : ["All India"],
    status: index % 13 === 0 ? "pending" : index % 17 === 0 ? "rejected" : status,
    created_at: now,
    updated_at: now,
  }));

export const eligibilityRules: EligibilityRule[] = [
  ...buildRules(schemes.slice(0, 20), "scheme", [18, 60], ["student", "farmer", "unemployed_youth", "woman_entrepreneur"], "approved"),
  ...buildRules(scholarships.slice(0, 16), "scholarship", [17, 35], ["student"], "approved"),
  ...buildRules(jobs.slice(0, 16), "job", [18, 42], ["unemployed_youth", "working_professional"], "approved"),
  ...buildRules(exams.slice(0, 12), "exam", [17, 35], ["student", "unemployed_youth", "working_professional"], "approved"),
];

export const getRulesForEntity = (entity_type: EligibilityEntityType, entity_id: string): EligibilityRule[] =>
  eligibilityRules.filter((rule) => rule.entity_type === entity_type && rule.entity_id === entity_id);
