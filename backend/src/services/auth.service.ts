import {
  authenticateUser,
  findUserById,
  registerUser,
  signOutUser,
  updateUserProfile as updateProfile,
  type UserCredentials,
  type UserProfile,
} from "../repositories/auth.repository";

export async function registerNewUser(data: { full_name: string; email: string; password: string }): Promise<UserProfile> {
  return registerUser(data);
}

export async function loginUser(credentials: UserCredentials): Promise<{ access_token: string; refresh_token?: string | null; user: UserProfile }> {
  return authenticateUser(credentials);
}

export async function fetchUserProfile(id: string): Promise<UserProfile | undefined> {
  return findUserById(id);
}

export async function logoutUser(token: string): Promise<void> {
  await signOutUser(token);
}

export async function updateUserProfile(
  id: string,
  updates: Partial<{
    full_name: string;
    age: number;
    state: string;
    category: string;
    dob: string;
    education_level: string;
    occupation: string;
    user_type: string;
    income_range: string;
    annual_income: number;
    gender: string;
    preferred_language: string;
    profile_completed: boolean;
  }>,
): Promise<UserProfile | undefined> {
  return updateProfile(id, updates);
}
