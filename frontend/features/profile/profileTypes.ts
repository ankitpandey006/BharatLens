export interface Profile {
  id: string;
  fullName: string;
  email?: string;
  locale?: string;
  state?: string;
  district?: string;
  educationLevel?: string;
  incomeBracket?: string;
  userType?: string;
  preferences?: string[];
  notificationsEnabled?: boolean;
}
