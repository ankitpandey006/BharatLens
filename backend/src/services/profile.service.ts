import { findUserById, updateUserProfile } from "../repositories/auth.repository";
import type { UserProfile } from "../repositories/auth.repository";

export async function fetchProfile(id: string): Promise<UserProfile | undefined> {
  return findUserById(id);
}

export async function modifyProfile(
  id: string,
  updates: Partial<
    Pick<
      UserProfile,
      | "full_name"
      | "age"
      | "gender"
      | "state"
      | "education_level"
      | "occupation"
      | "annual_income"
      | "category"
      | "user_type"
      | "preferred_language"
      | "profile_completed"
      | "dob"
      | "income_range"
    >
  >,
): Promise<UserProfile | undefined> {
  return updateUserProfile(id, updates);
}
