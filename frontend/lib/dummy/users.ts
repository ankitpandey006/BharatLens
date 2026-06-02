export type UserRole = "citizen" | "admin" | "reviewer";
export type UserStatus = "active" | "pending" | "approved" | "rejected";

export interface DummyUser {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  status: UserStatus;
  last_login_at: string;
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";

const userSeeds: Array<Pick<DummyUser, "full_name" | "email" | "role" | "is_active" | "status" | "last_login_at">> = [
  { full_name: "Aarav Mishra", email: "aarav.mishra@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T18:15:00.000Z" },
  { full_name: "Priya Kumari", email: "priya.kumari@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T10:25:00.000Z" },
  { full_name: "Rohan Das", email: "rohan.das@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-26T21:40:00.000Z" },
  { full_name: "Sana Fatima", email: "sana.fatima@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T12:00:00.000Z" },
  { full_name: "Vikram Singh", email: "vikram.singh@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-25T07:50:00.000Z" },
  { full_name: "Neha Yadav", email: "neha.yadav@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T16:42:00.000Z" },
  { full_name: "Manoj Choudhary", email: "manoj.choudhary@bharatlens.in", role: "citizen", is_active: false, status: "pending", last_login_at: "2026-05-18T09:20:00.000Z" },
  { full_name: "Kavya Iyer", email: "kavya.iyer@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-26T13:15:00.000Z" },
  { full_name: "Aditya Patil", email: "aditya.patil@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T08:00:00.000Z" },
  { full_name: "Muskan Ali", email: "muskan.ali@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-26T19:10:00.000Z" },
  { full_name: "Harshita Roy", email: "harshita.roy@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T14:05:00.000Z" },
  { full_name: "Tsering Dorje", email: "tsering.dorje@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-23T06:40:00.000Z" },
  { full_name: "Sunil Meena", email: "sunil.meena@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T17:55:00.000Z" },
  { full_name: "Anjali Verma", email: "anjali.verma@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T09:44:00.000Z" },
  { full_name: "Deepak Reddy", email: "deepak.reddy@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-24T20:30:00.000Z" },
  { full_name: "Farheen Khan", email: "farheen.khan@bharatlens.in", role: "citizen", is_active: false, status: "rejected", last_login_at: "2026-05-01T11:35:00.000Z" },
  { full_name: "Arjun Nair", email: "arjun.nair@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-26T15:22:00.000Z" },
  { full_name: "Nisha Dutta", email: "nisha.dutta@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-25T18:45:00.000Z" },
  { full_name: "Gaurav Tiwari", email: "gaurav.tiwari@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T04:55:00.000Z" },
  { full_name: "Rekha Devi", email: "rekha.devi@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T13:20:00.000Z" },
  { full_name: "Suresh Pawar", email: "suresh.pawar@bharatlens.in", role: "citizen", is_active: false, status: "pending", last_login_at: "2026-05-14T08:45:00.000Z" },
  { full_name: "Poonam Sharma", email: "poonam.sharma@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-25T09:14:00.000Z" },
  { full_name: "Rahul Banerjee", email: "rahul.banerjee@bharatlens.in", role: "citizen", is_active: true, status: "approved", last_login_at: "2026-05-27T11:11:00.000Z" },
  { full_name: "Megha Sahu", email: "megha.sahu@bharatlens.in", role: "reviewer", is_active: true, status: "approved", last_login_at: "2026-05-27T18:30:00.000Z" },
  { full_name: "Ananya Srivastava", email: "ananya.srivastava@bharatlens.in", role: "admin", is_active: true, status: "approved", last_login_at: "2026-05-27T20:00:00.000Z" },
];

export const users: DummyUser[] = userSeeds.map((user, index) => ({
  id: `user-${String(index + 1).padStart(2, "0")}`,
  ...user,
  created_at: now,
  updated_at: now,
}));

export const getActiveUsers = (): DummyUser[] => users.filter((user) => user.is_active);
export const getUsersByRole = (role: UserRole): DummyUser[] => users.filter((user) => user.role === role);
