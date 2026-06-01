import {
  authenticateUser,
  findUserById,
  registerUser,
  type UserCredentials,
  type UserProfile,
} from "../repositories/auth.repository";

export async function registerNewUser(data: { name: string; email: string; password: string }): Promise<UserProfile> {
  return registerUser(data);
}

export async function loginUser(credentials: UserCredentials): Promise<{ token: string; user: UserProfile }> {
  return authenticateUser(credentials);
}

export async function fetchUserProfile(id: string): Promise<UserProfile | undefined> {
  return findUserById(id);
}
