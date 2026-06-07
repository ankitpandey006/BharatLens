export interface Profile {
  id: string;
  fullName: string;
  email?: string;
  locale?: string;
  state?: string;
  educationLevel?: string;
  incomeBracket?: string;
  userType?: string;
  preferences?: string[];
  notificationsEnabled?: boolean;
}
