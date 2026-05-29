import { users } from "./users";

export type SocialCategory = "SC" | "ST" | "OBC" | "General" | "EWS";
export type Gender = "male" | "female" | "other";
export type EducationLevel = "class_10" | "class_12" | "diploma" | "graduate" | "postgraduate" | "phd";
export type IncomeRange = "below_2_lakh" | "2_to_5_lakh" | "5_to_8_lakh" | "8_to_12_lakh" | "above_12_lakh";
export type UserType = "student" | "farmer" | "unemployed_youth" | "working_professional" | "woman_entrepreneur";

export interface UserProfile {
  id: string;
  user_id: string;
  state: string;
  district: string;
  category: SocialCategory;
  gender: Gender;
  dob: string;
  education_level: EducationLevel;
  income_range: IncomeRange;
  occupation: string;
  user_type: UserType;
  language_preference: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

const now = "2026-05-28T00:00:00.000Z";

const profileSeeds: Omit<UserProfile, "id" | "user_id" | "created_at" | "updated_at">[] = [
  { state: "Uttar Pradesh", district: "Prayagraj", category: "OBC", gender: "male", dob: "2004-03-18", education_level: "graduate", income_range: "2_to_5_lakh", occupation: "BTech Student", user_type: "student", language_preference: "Hindi", profile_completed: true },
  { state: "Bihar", district: "Gaya", category: "SC", gender: "female", dob: "2002-07-09", education_level: "postgraduate", income_range: "below_2_lakh", occupation: "MA Student", user_type: "student", language_preference: "Hindi", profile_completed: true },
  { state: "West Bengal", district: "Howrah", category: "General", gender: "male", dob: "1999-12-21", education_level: "graduate", income_range: "2_to_5_lakh", occupation: "Exam Aspirant", user_type: "unemployed_youth", language_preference: "Bengali", profile_completed: true },
  { state: "Telangana", district: "Hyderabad", category: "OBC", gender: "female", dob: "2001-01-14", education_level: "graduate", income_range: "5_to_8_lakh", occupation: "Software Trainee", user_type: "working_professional", language_preference: "English", profile_completed: true },
  { state: "Punjab", district: "Ludhiana", category: "General", gender: "male", dob: "1988-09-02", education_level: "class_12", income_range: "2_to_5_lakh", occupation: "Small Farmer", user_type: "farmer", language_preference: "Punjabi", profile_completed: true },
  { state: "Madhya Pradesh", district: "Indore", category: "OBC", gender: "female", dob: "1998-11-30", education_level: "diploma", income_range: "2_to_5_lakh", occupation: "Nursing Trainee", user_type: "working_professional", language_preference: "Hindi", profile_completed: true },
  { state: "Rajasthan", district: "Kota", category: "ST", gender: "male", dob: "1997-04-17", education_level: "graduate", income_range: "below_2_lakh", occupation: "Unemployed Graduate", user_type: "unemployed_youth", language_preference: "Hindi", profile_completed: false },
  { state: "Tamil Nadu", district: "Chennai", category: "General", gender: "female", dob: "2000-05-08", education_level: "postgraduate", income_range: "5_to_8_lakh", occupation: "Research Scholar", user_type: "student", language_preference: "Tamil", profile_completed: true },
  { state: "Maharashtra", district: "Nashik", category: "EWS", gender: "male", dob: "1995-08-12", education_level: "graduate", income_range: "2_to_5_lakh", occupation: "Agri Startup Founder", user_type: "farmer", language_preference: "Marathi", profile_completed: true },
  { state: "Assam", district: "Kamrup", category: "OBC", gender: "female", dob: "2003-10-03", education_level: "class_12", income_range: "below_2_lakh", occupation: "NEET Aspirant", user_type: "student", language_preference: "Assamese", profile_completed: true },
  { state: "Odisha", district: "Cuttack", category: "SC", gender: "female", dob: "2004-06-16", education_level: "class_12", income_range: "below_2_lakh", occupation: "School Student", user_type: "student", language_preference: "Odia", profile_completed: true },
  { state: "Ladakh", district: "Leh", category: "ST", gender: "male", dob: "1996-01-25", education_level: "graduate", income_range: "2_to_5_lakh", occupation: "Tourism Worker", user_type: "working_professional", language_preference: "Hindi", profile_completed: true },
  { state: "Rajasthan", district: "Dausa", category: "ST", gender: "male", dob: "1993-04-20", education_level: "class_10", income_range: "below_2_lakh", occupation: "Farm Laborer", user_type: "farmer", language_preference: "Hindi", profile_completed: true },
  { state: "Delhi", district: "South Delhi", category: "General", gender: "female", dob: "1994-02-07", education_level: "postgraduate", income_range: "8_to_12_lakh", occupation: "Policy Analyst", user_type: "working_professional", language_preference: "English", profile_completed: true },
  { state: "Andhra Pradesh", district: "Vijayawada", category: "OBC", gender: "male", dob: "1998-03-11", education_level: "diploma", income_range: "2_to_5_lakh", occupation: "Electrical Technician", user_type: "working_professional", language_preference: "Telugu", profile_completed: true },
  { state: "Uttar Pradesh", district: "Azamgarh", category: "OBC", gender: "female", dob: "2000-07-01", education_level: "graduate", income_range: "below_2_lakh", occupation: "Exam Aspirant", user_type: "unemployed_youth", language_preference: "Hindi", profile_completed: false },
  { state: "Kerala", district: "Kozhikode", category: "General", gender: "male", dob: "1992-08-28", education_level: "graduate", income_range: "5_to_8_lakh", occupation: "Banking Aspirant", user_type: "unemployed_youth", language_preference: "Malayalam", profile_completed: true },
  { state: "Tripura", district: "West Tripura", category: "ST", gender: "female", dob: "2001-09-13", education_level: "graduate", income_range: "2_to_5_lakh", occupation: "Teacher Training Student", user_type: "student", language_preference: "Bengali", profile_completed: true },
  { state: "Uttar Pradesh", district: "Varanasi", category: "General", gender: "male", dob: "1990-11-29", education_level: "postgraduate", income_range: "8_to_12_lakh", occupation: "Private School Teacher", user_type: "working_professional", language_preference: "Hindi", profile_completed: true },
  { state: "Bihar", district: "Siwan", category: "SC", gender: "female", dob: "1986-01-03", education_level: "class_10", income_range: "below_2_lakh", occupation: "Self Help Group Member", user_type: "woman_entrepreneur", language_preference: "Hindi", profile_completed: true },
  { state: "Maharashtra", district: "Satara", category: "OBC", gender: "male", dob: "1989-10-15", education_level: "class_12", income_range: "2_to_5_lakh", occupation: "Sugarcane Farmer", user_type: "farmer", language_preference: "Marathi", profile_completed: false },
  { state: "Haryana", district: "Rohtak", category: "General", gender: "female", dob: "1995-12-10", education_level: "graduate", income_range: "5_to_8_lakh", occupation: "MSME Owner", user_type: "woman_entrepreneur", language_preference: "Hindi", profile_completed: true },
  { state: "West Bengal", district: "Kolkata", category: "General", gender: "male", dob: "1997-02-18", education_level: "postgraduate", income_range: "5_to_8_lakh", occupation: "Data Analyst", user_type: "working_professional", language_preference: "Bengali", profile_completed: true },
  { state: "Chhattisgarh", district: "Raipur", category: "OBC", gender: "female", dob: "1993-06-23", education_level: "graduate", income_range: "2_to_5_lakh", occupation: "Content Reviewer", user_type: "working_professional", language_preference: "Hindi", profile_completed: true },
  { state: "Uttar Pradesh", district: "Lucknow", category: "General", gender: "female", dob: "1991-04-05", education_level: "postgraduate", income_range: "8_to_12_lakh", occupation: "Platform Administrator", user_type: "working_professional", language_preference: "English", profile_completed: true },
];

export const userProfiles: UserProfile[] = users.map((user, index) => ({
  id: `profile-${String(index + 1).padStart(2, "0")}`,
  user_id: user.id,
  ...profileSeeds[index],
  created_at: now,
  updated_at: now,
}));

export const getProfilesByState = (state: string): UserProfile[] =>
  userProfiles.filter((profile) => profile.state === state);
