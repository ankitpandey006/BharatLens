import { supabase, supabaseAuth } from "../config/supabase";
import type { User } from "@supabase/supabase-js";
import { AppError } from "../utils/app-error";

export type UserRole = "user" | "admin" | "moderator";

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  role: UserRole;
  age?: number | null;
  state?: string | null;
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
  profile_completion_percentage?: number;
  missing_profile_fields?: string[];
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
  return Boolean(
    profile.age &&
      typeof profile.state === "string" && profile.state.trim().length > 0 &&
      typeof profile.education_level === "string" && profile.education_level.trim().length > 0 &&
      typeof profile.occupation === "string" && profile.occupation.trim().length > 0 &&
      typeof profile.user_type === "string" && profile.user_type.trim().length > 0,
  );
}

function calculateProfileCompletion(profile: Partial<UserProfile> | UserProfile): {
  profile_completed: boolean;
  profile_completion_percentage: number;
  missing_profile_fields: string[];
} {
  const requiredFields = [
    "full_name",
    "age",
    "state",
    "category",
    "education_level",
    "occupation",
    "user_type",
    "income_range",
    "annual_income",
    "gender",
    "preferred_language",
  ] as const;

  const missing: string[] = [];

  for (const field of requiredFields) {
    const value = profile[field as keyof typeof profile];
    if (value === null || value === undefined || value === "") {
      missing.push(field);
    }
  }

  const completed = requiredFields.length - missing.length;
  const percentage = Math.round((completed / requiredFields.length) * 100);

  return {
    profile_completed: percentage === 100,
    profile_completion_percentage: percentage,
    missing_profile_fields: missing,
  };
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

function deriveUserFullName(authUser: User): string {
  const metadata = authUser.user_metadata as Record<string, unknown> | null;
  const fullName = typeof metadata?.full_name === "string" ? metadata.full_name.trim() : undefined;
  if (fullName) return fullName;

  const name = typeof metadata?.name === "string" ? metadata.name.trim() : undefined;
  if (name) return name;

  const email = authUser.email ?? "";
  const prefix = email.split("@")[0]?.trim();
  if (prefix) return prefix;

  return "BharatLens User";
}

async function insertWithMissingColumnFallback(table: "users" | "user_profiles", payload: Record<string, unknown>): Promise<void> {
  let mutablePayload = { ...payload };

  while (Object.keys(mutablePayload).length > 0) {
    const { error } = await supabase.from(table).insert(mutablePayload);

    if (!error) {
      return;
    }

    const lowerMessage = (error.message ?? "").toLowerCase();
    if (lowerMessage.includes("duplicate") || lowerMessage.includes("unique")) {
      return;
    }

    const missingColumn = extractMissingColumn(error.message);
    if (!missingColumn || !(missingColumn in mutablePayload)) {
      throw new AppError(`Failed to insert into ${table}: ${error.message}`, 500);
    }

    delete mutablePayload[missingColumn];
  }
}

async function ensureLocalUserRecord(authUser: User): Promise<void> {
  const { data: existingUser, error: userError } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("id", authUser.id)
    .maybeSingle();

  if (userError) {
    throw new AppError(`Failed to query local user record: ${userError.message}`, 500);
  }

  if (existingUser) {
    const needsName = !existingUser.full_name || String(existingUser.full_name).trim().length === 0;
    const fallbackName = deriveUserFullName(authUser);
    if (needsName && fallbackName) {
      const { error: updateError } = await supabase
        .from("users")
        .update({ full_name: fallbackName })
        .eq("id", authUser.id);

      if (updateError) {
        throw new AppError(`Failed to update existing user record: ${updateError.message}`, 500);
      }
    }

    return;
  }

  const email = authUser.email ?? "";
  await insertWithMissingColumnFallback("users", {
    id: authUser.id,
    email,
    full_name: deriveUserFullName(authUser),
    role: "user",
  });
}

async function ensureLocalProfileRecord(userId: string): Promise<void> {
  const { data: existingProfile, error } = await supabase
    .from("user_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(`Failed to query user profile record: ${error.message}`, 500);
  }

  if (existingProfile) {
    return;
  }

  await insertWithMissingColumnFallback("user_profiles", {
    user_id: userId,
    profile_completed: false,
    preferred_language: "hinglish",
  });
}

export async function syncAuthenticatedUser(authUser: User): Promise<UserProfile> {
  await ensureLocalUserRecord(authUser);
  await ensureLocalProfileRecord(authUser.id);

  const user = await findUserById(authUser.id);
  if (!user) {
    throw new AppError("Failed to synchronize authenticated user record", 500);
  }

  return user;
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

  let { data: profileRecord, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", id)
    .maybeSingle();

  if (profileError) {
    throw new AppError(`Failed to fetch user profile: ${profileError.message}`, 500);
  }

  if (!profileRecord) {
    await ensureLocalProfileRecord(id);

    const { data: refreshedProfile, error: refreshedProfileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", id)
      .maybeSingle();

    if (refreshedProfileError) {
      throw new AppError(`Failed to fetch user profile after creation: ${refreshedProfileError.message}`, 500);
    }

    profileRecord = refreshedProfile ?? undefined;
  }

  const userProfile: UserProfile = {
    id: userRecord.id,
    email: userRecord.email,
    full_name: userRecord.full_name,
    role: userRecord.role as "user" | "admin" | "moderator",
    age: (profileRecord?.age as number | null | undefined) ?? (userRecord.age as number | null | undefined) ?? null,
    state: profileRecord?.state ?? null,
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

  // Calculate profile completion
  const completion = calculateProfileCompletion(userProfile);
  userProfile.profile_completed = completion.profile_completed;
  userProfile.profile_completion_percentage = completion.profile_completion_percentage;
  userProfile.missing_profile_fields = completion.missing_profile_fields;

  return userProfile;
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
    full_name: updates.full_name ?? existing.full_name,
    age: updates.age ?? existing.age,
    state: updates.state ?? existing.state,
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

  // Always calculate from actual fields - do not trust frontend profile_completed
  const completion = calculateProfileCompletion(profileUpdates);
  const profileCompleted = completion.profile_completed;

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
