import { useAuth as useAuthContext } from "@/components/auth/AuthProvider";

export function useAuth() {
  return useAuthContext();
}
