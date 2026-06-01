export interface EligibilityInput {
  age: number;
  state: string;
  income: number;
  education: string;
  occupation: string;
}

export interface EligibilityResult {
  eligible: boolean;
  score: number;
  reasons: string[];
}

export interface EligibilityRepository {
  evaluateEligibility(profile: EligibilityInput): Promise<EligibilityResult>;
}

const eligibilityRules = {
  age: {
    min: 18,
    max: 60,
  },
  incomeThreshold: 500000,
  priorityStates: ["Bihar", "Uttar Pradesh", "Maharashtra"],
  preferredEducation: ["High School", "Diploma", "Graduate", "Postgraduate"],
};

export async function evaluateEligibility(profile: EligibilityInput): Promise<EligibilityResult> {
  const reasons: string[] = [];
  let score = 0;

  if (profile.age >= eligibilityRules.age.min && profile.age <= eligibilityRules.age.max) {
    score += 20;
  } else {
    reasons.push("Age is outside the typical eligibility window.");
  }

  if (profile.income <= eligibilityRules.incomeThreshold) {
    score += 20;
  } else {
    reasons.push("Income is above the preferred threshold.");
  }

  if (eligibilityRules.priorityStates.includes(profile.state)) {
    score += 20;
  } else {
    reasons.push("Applicant state is not part of the priority list.");
  }

  if (eligibilityRules.preferredEducation.includes(profile.education)) {
    score += 20;
  } else {
    reasons.push("Education level is not in the typical preferred range.");
  }

  if (profile.occupation.toLowerCase().includes("student") || profile.occupation.toLowerCase().includes("farmer") || profile.occupation.toLowerCase().includes("entrepreneur")) {
    score += 20;
  } else {
    reasons.push("Occupation does not match common targeted beneficiary groups.");
  }

  return {
    eligible: score >= 60,
    score,
    reasons,
  };
}
