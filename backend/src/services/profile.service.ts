import { getProfileById, updateProfile, type ProfileRepository } from "../repositories/profile.repository";
import type { UserProfile } from "../repositories/auth.repository";

export async function fetchProfile(id: string): Promise<UserProfile | undefined> {
  return getProfileById(id);
}

export async function modifyProfile(
  id: string,
  updates: Partial<Pick<UserProfile, "name" | "occupation" | "state">>,
): Promise<UserProfile | undefined> {
  return updateProfile(id, updates);
}
