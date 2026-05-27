export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: "user" | "admin";
  profileCompleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
