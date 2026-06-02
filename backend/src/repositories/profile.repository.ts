import type { UserProfile } from "./auth.repository";

const profiles: UserProfile[] = [
  {
    id: "user-001",
    full_name: "Asha Sharma",
    email: "asha@example.com",
    role: "user",
    state: "Maharashtra",
    occupation: "Student",
  },
];

export interface ProfileRepository {
  getProfileById(id: string): Promise<UserProfile | undefined>;
  updateProfile(id: string, updates: Partial<Pick<UserProfile, "full_name" | "occupation" | "state">>): Promise<UserProfile | undefined>;
}

export async function getProfileById(id: string): Promise<UserProfile | undefined> {
  return profiles.find((profile) => profile.id === id);
}

export async function updateProfile(id: string, updates: Partial<Pick<UserProfile, "full_name" | "occupation" | "state">>): Promise<UserProfile | undefined> {
  const profile = profiles.find((item) => item.id === id);

  if (!profile) {
    return undefined;
  }

  const updatedProfile = { ...profile, ...updates };
  const index = profiles.findIndex((item) => item.id === id);
  profiles[index] = updatedProfile;

  return updatedProfile;
}
