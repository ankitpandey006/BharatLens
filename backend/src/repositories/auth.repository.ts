import { supabase, supabaseAuth } from "../config/supabase";
import { AppError } from "../utils/app-error";

export type UserRole = "user" | "admin" | "moderator";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  role: UserRole;
  age?: number | null;
  state?: string | null;
  district?: string | null;
  category?: string | null;
  dob?: string | null;
  education_level?: string | null;
  occupation?: string | null;
  user_type?: string | null;
  income_range?: string | null;
  annual_income?: number | null;
  gender?: string | null;
  preferred_language?: string | null;
  profile_completed?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface AuthRepository {
  registerUser(data: { full_name: string; email: string; password: string }): Promise<UserProfile>;
  authenticateUser(credentials: UserCredentials): Promise<{ access_token: string; refresh_token?: string | null; user: UserProfile }>;
  findUserById(id: string): Promise<UserProfile | undefined>;
  signOutUser(accessToken: string): Promise<void>;
  updateUserProfile(
    id: string,
    updates: Partial<{
      full_name: string | null;
      age: number | null;
      state: string | null;
      district: string | null;
      category: string | null;
      dob: string | null;
      education_level: string | null;
      occupation: string | null;
      user_type: string | null;
      income_range: string | null;
      annual_income: number | null;
      gender: string | null;
      preferred_language: string | null;
      profile_completed: boolean;
    }>,
  ): Promise<UserProfile | undefined>;
}

function mergeProfileData(user: UserProfile, profile: Partial<UserProfile>): UserProfile {
  return {
    ...user,
    ...profile,
  };
}

function calculateProfileCompleted(profile: Partial<UserProfile>): boolean {
  return [profile.state, profile.category, profile.dob, profile.education_level, profile.occupation, profile.user_type].every(
    (value) => typeof value === "string" && value.trim().length > 0,
  );
}

function extractMissingColumn(errorMessage: string): string | null {
  const directMatch = errorMessage.match(/column\s+([a-zA-Z0-9_."]+)\s+does not exist/i);
  if (directMatch?.[1]) {
    return directMatch[1].split(".").pop()?.replace(/"/g, "") ?? null;
  }

  const schemaCacheMatch = errorMessage.match(/Could not find the '([a-zA-Z0-9_]+)' column/i);
  if (schemaCacheMatch?.[1]) {
    return schemaCacheMatch[1];
  }

  return null;
}

async function updateWithMissingColumnFallback(
  table: "users" | "user_profiles",
  matchColumn: "id" | "user_id",
  matchValue: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const mutablePayload = { ...payload };

  while (Object.keys(mutablePayload).length > 0) {
    const { error } = await supabase.from(table).update(mutablePayload).eq(matchColumn, matchValue);

    if (!error) {
      return;
    }

    const missingColumn = extractMissingColumn(error.message);
    if (!missingColumn || !(missingColumn in mutablePayload)) {
      throw new AppError(`Failed to update ${table}: ${error.message}`, 500);
    }

    delete mutablePayload[missingColumn];
  }
}

export async function registerUser(data: { full_name: string; email: string; password: string }): Promise<UserProfile> {
  const { data: authData, error: authError } = await supabaseAuth.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: { full_name: data.full_name },
    },
  });

  if (authError || !authData?.user) {
    throw new AppError(authError?.message ?? "Failed to create auth user", 400);
  }

  const authUser = authData.user;

  const { error: userInsertError } = await supabase
    .from("users")
    .insert({
      id: authUser.id,
      email: authUser.email,
      full_name: data.full_name,
      role: "user",
    });

  if (userInsertError) {
    throw new AppError(`Failed to insert user record: ${userInsertError.message}`, 500);
  }

  const { error: profileInsertError } = await supabase.from("user_profiles").insert({
    user_id: authUser.id,
    profile_completed: false,
  });

  if (profileInsertError) {
    throw new AppError(`Failed to create user profile: ${profileInsertError.message}`, 500);
  }

  return {
    id: authUser.id,
    email: authUser.email ?? data.email,
    full_name: data.full_name,
    role: "user",
    profile_completed: false,
  };
}

export async function authenticateUser(credentials: UserCredentials): Promise<{ access_token: string; refresh_token?: string | null; user: UserProfile }> {
  const { data, error } = await supabaseAuth.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  });

  if (error || !data?.session || !data?.user) {
    throw new AppError(error?.message ?? "Invalid email or password", 401);
  }

  const user = await findUserById(data.user.id);

  if (!user) {
    throw new AppError("Authenticated user not found in application records", 401);
  }

  return {
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    user,
  };
}

export async function findUserById(id: string): Promise<UserProfile | undefined> {
  const { data: userRecord, error: userError } = await supabase
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (userError) {
    throw new AppError(`Failed to fetch user record: ${userError.message}`, 500);
  }

  if (!userRecord) {
    return undefined;
  }

  const { data: profileRecord, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", id)
    .maybeSingle();

  if (profileError) {
    throw new AppError(`Failed to fetch user profile: ${profileError.message}`, 500);
  }

  return {
    id: userRecord.id,
    email: userRecord.email,
    full_name: userRecord.full_name,
    role: userRecord.role as "user" | "admin" | "moderator",
    age: (profileRecord?.age as number | null | undefined) ?? (userRecord.age as number | null | undefined) ?? null,
    state: profileRecord?.state ?? null,
    district: (profileRecord?.district as string | null | undefined) ?? (userRecord.district as string | null | undefined) ?? null,
    category: profileRecord?.category ?? null,
    dob: profileRecord?.dob ?? null,
    education_level: profileRecord?.education_level ?? null,
    occupation: profileRecord?.occupation ?? null,
    user_type: profileRecord?.user_type ?? null,
    income_range: profileRecord?.income_range ?? null,
    annual_income:
      (profileRecord?.annual_income as number | null | undefined) ?? (userRecord.annual_income as number | null | undefined) ?? null,
    gender: profileRecord?.gender ?? null,
    preferred_language:
      (profileRecord?.preferred_language as string | null | undefined) ??
      (userRecord.preferred_language as string | null | undefined) ??
      null,
    profile_completed: profileRecord?.profile_completed ?? false,
    created_at: userRecord.created_at,
    updated_at: userRecord.updated_at,
  };
}

export async function signOutUser(accessToken: string): Promise<void> {
  const { error } = await supabase.auth.admin.signOut(accessToken, "global");

  if (error) {
    throw new AppError(`Logout failed: ${error.message}`, 500);
  }
}

export async function updateUserProfile(
  id: string,
  updates: Partial<{
    full_name: string | null;
    age: number | null;
    state: string | null;
    district: string | null;
    category: string | null;
    dob: string | null;
    education_level: string | null;
    occupation: string | null;
    user_type: string | null;
    income_range: string | null;
    annual_income: number | null;
    gender: string | null;
    preferred_language: string | null;
    profile_completed: boolean;
  }>,
): Promise<UserProfile | undefined> {
  const existing = await findUserById(id);

  if (!existing) {
    return undefined;
  }

  const profileUpdates = {
    age: updates.age ?? existing.age,
    state: updates.state ?? existing.state,
    district: updates.district ?? existing.district,
    category: updates.category ?? existing.category,
    dob: updates.dob ?? existing.dob,
    education_level: updates.education_level ?? existing.education_level,
    occupation: updates.occupation ?? existing.occupation,
    user_type: updates.user_type ?? existing.user_type,
    income_range: updates.income_range ?? existing.income_range,
    annual_income: updates.annual_income ?? existing.annual_income,
    gender: updates.gender ?? existing.gender,
    preferred_language: updates.preferred_language ?? existing.preferred_language,
  };

  const profileCompleted = Object.prototype.hasOwnProperty.call(updates, "profile_completed")
    ? updates.profile_completed
    : calculateProfileCompleted(profileUpdates);

  if (Object.prototype.hasOwnProperty.call(updates, "full_name")) {
    const { error: userUpdateError } = await supabase
      .from("users")
      .update({ full_name: updates.full_name ?? null })
      .eq("id", id);

    if (userUpdateError) {
      throw new AppError(`Failed to update user name: ${userUpdateError.message}`, 500);
    }
  }

  const optionalCommonUpdates: Record<string, unknown> = {};
  if (Object.prototype.hasOwnProperty.call(updates, "age")) {
    optionalCommonUpdates.age = updates.age ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, "district")) {
    optionalCommonUpdates.district = updates.district ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, "annual_income")) {
    optionalCommonUpdates.annual_income = updates.annual_income ?? null;
  }
  if (Object.prototype.hasOwnProperty.call(updates, "preferred_language")) {
    optionalCommonUpdates.preferred_language = updates.preferred_language ?? null;
  }

  if (Object.keys(optionalCommonUpdates).length > 0) {
    await updateWithMissingColumnFallback("users", "id", id, optionalCommonUpdates);
  }

  await updateWithMissingColumnFallback("user_profiles", "user_id", id, {
    ...optionalCommonUpdates,
    state: profileUpdates.state,
    category: profileUpdates.category,
    dob: profileUpdates.dob,
    education_level: profileUpdates.education_level,
    occupation: profileUpdates.occupation,
    user_type: profileUpdates.user_type,
    income_range: profileUpdates.income_range,
    gender: profileUpdates.gender,
    profile_completed: profileCompleted,
  });

  return findUserById(id);
}
