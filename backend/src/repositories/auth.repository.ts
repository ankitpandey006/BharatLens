export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  state: string;
  occupation: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

const users: Array<UserProfile & { password: string }> = [
  {
    id: "user-001",
    name: "Asha Sharma",
    email: "asha@example.com",
    password: "password123",
    role: "user",
    state: "Maharashtra",
    occupation: "Student",
  },
];

export interface AuthRepository {
  registerUser(data: { name: string; email: string; password: string }): Promise<UserProfile>;
  authenticateUser(credentials: UserCredentials): Promise<{ token: string; user: UserProfile }>;
  findUserById(id: string): Promise<UserProfile | undefined>;
}

export async function registerUser(data: { name: string; email: string; password: string }): Promise<UserProfile> {
  const user: UserProfile = {
    id: `user-${String(users.length + 1).padStart(3, "0")}`,
    name: data.name,
    email: data.email,
    role: "user",
    state: "Unknown",
    occupation: "Unknown",
  };

  users.push({ ...user, password: data.password });
  return user;
}

export async function authenticateUser(credentials: UserCredentials): Promise<{ token: string; user: UserProfile }> {
  const user = users.find((item) => item.email === credentials.email && item.password === credentials.password);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  return {
    token: `token-${user.id}`,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      state: user.state,
      occupation: user.occupation,
    },
  };
}

export async function findUserById(id: string): Promise<UserProfile | undefined> {
  return users.find((item) => item.id === id);
}
