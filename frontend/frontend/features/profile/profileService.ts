import type { Profile } from "./profileTypes";

export async function getProfile(): Promise<Profile> {
  return {
    id: "profile-1",
    fullName: "Student User",
    email: "user@example.com",
    locale: "en-IN",
    state: "Karnataka",
    district: "Bangalore",
    educationLevel: "Undergraduate",
    incomeBracket: "Low",
    userType: "Student",
    preferences: ["Scholarships", "Schemes", "Jobs"],
    notificationsEnabled: true,
  };
}
