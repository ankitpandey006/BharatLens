import { evaluateEligibility, type EligibilityInput, type EligibilityResult } from "../repositories/eligibility.repository";

export async function determineEligibility(profile: EligibilityInput): Promise<EligibilityResult> {
  return evaluateEligibility(profile);
}
