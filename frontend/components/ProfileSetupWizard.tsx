"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, updateProfile } from "@/lib/api/auth-api";

const ageOptions = [
  { id: "under-18", label: "Under 18", value: 17 },
  { id: "18-25", label: "18-25", value: 22 },
  { id: "26-35", label: "26-35", value: 30 },
  { id: "36-50", label: "36-50", value: 43 },
  { id: "50-plus", label: "50+", value: 55 },
];

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

const stateOptions = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Puducherry",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
];

const userTypeOptions = [
  "Student",
  "Job Seeker",
  "Farmer",
  "Women Benefits",
  "Citizen Services",
  "Exam Aspirant",
  "Scholarship Finder",
  "Other",
];

const educationOptions = [
  "School",
  "10th Pass",
  "12th Pass",
  "Diploma",
  "Graduate",
  "Post Graduate",
  "PhD",
  "Other",
];

const occupationOptions = [
  "Student",
  "Job Seeker",
  "Farmer",
  "Self Employed",
  "Private Employee",
  "Government Employee",
  "Homemaker",
  "Unemployed",
  "Other",
];

const incomeOptions = [
  "Below 1 Lakh",
  "1-3 Lakh",
  "3-5 Lakh",
  "5-8 Lakh",
  "Above 8 Lakh",
  "Prefer not to say",
];

const categoryOptions = [
  "General",
  "OBC",
  "SC",
  "ST",
  "EWS",
  "Minority",
  "Prefer not to say",
];

const languageOptions = ["Hinglish", "Hindi", "English"];

const interestOptions = [
  "Government Schemes",
  "Scholarships",
  "Government Jobs",
  "Exams",
  "Welfare Benefits",
  "Agriculture Schemes",
  "Women Benefits",
  "Startup Programs",
];

const steps = [
  { title: "General", description: "Basic details for personalization." },
  { title: "Goal", description: "Tell us what you are looking for." },
  { title: "Education", description: "Education and work information." },
  { title: "Benefits", description: "Income and category details." },
  { title: "Preferences", description: "Interests and language." },
];

const initialFormState = {
  full_name: "",
  ageGroup: "",
  gender: "",
  state: "",
  user_type: "",
  education_level: "",
  occupation: "",
  income_range: "",
  category: "",
  preferred_language: "Hinglish",
  interests: [] as string[],
};

function buildValidationMessage(step: number, form: typeof initialFormState) {
  if (step === 0) {
    if (!form.full_name.trim()) return "Please enter your full name.";
    if (!form.ageGroup) return "Please choose your age group.";
    if (!form.gender) return "Please choose your gender.";
    if (!form.state) return "Please select your state.";
  }

  if (step === 1 && !form.user_type) {
    return "Please choose your main goal.";
  }

  if (step === 2) {
    if (!form.education_level) return "Please choose your education level.";
    if (!form.occupation) return "Please choose your occupation.";
  }

  if (step === 3) {
    if (!form.income_range) return "Please select your income range.";
    if (!form.category) return "Please select your category.";
  }

  if (step === 4 && !form.preferred_language) {
    return "Please choose your preferred language.";
  }

  return "";
}

export default function ProfileSetupWizard() {
  const router = useRouter();

  const [stepIndex, setStepIndex] = useState(0);
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [userReady, setUserReady] = useState(false);

  useEffect(() => {
    let canceled = false;

    const loadProfile = async () => {
      try {
        const user = await getCurrentUser();

        if (canceled) return;

        if (user.profile_completed === true) {
          router.replace("/dashboard");
          return;
        }

        setFormData((current) => ({
          ...current,
          full_name: user.full_name ?? current.full_name,
          gender: user.gender ?? current.gender,
          state: user.state ?? current.state,
          education_level: user.education_level ?? current.education_level,
          occupation: user.occupation ?? current.occupation,
          income_range: user.income_range ?? current.income_range,
          category: user.category ?? current.category,
          user_type: user.user_type ?? current.user_type,
          preferred_language:
            user.preferred_language ?? current.preferred_language,
          ageGroup:
            user.age != null
              ? ageOptions.find((option) => option.value === user.age)?.id ||
                current.ageGroup
              : current.ageGroup,
        }));
      } catch {
        // Continue with defaults.
      } finally {
        if (!canceled) {
          setUserReady(true);
        }
      }
    };

    void loadProfile();

    return () => {
      canceled = true;
    };
  }, [router]);

  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);
  const stepError = buildValidationMessage(stepIndex, formData);
  const canContinue = !stepError;

  const handleSelect = (key: keyof typeof initialFormState, value: string) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleToggleInterest = (value: string) => {
    setFormData((current) => {
      const alreadySelected = current.interests.includes(value);

      return {
        ...current,
        interests: alreadySelected
          ? current.interests.filter((item) => item !== value)
          : [...current.interests, value],
      };
    });
  };

  const handleNext = () => {
    setMessage(null);

    if (!canContinue) {
      setMessage(stepError);
      return;
    }

    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    void handleSubmit();
  };

  const handleBack = () => {
    setMessage(null);
    setStepIndex((current) => Math.max(0, current - 1));
  };

  const handleSubmit = async () => {
    setMessage(null);
    setSubmitting(true);

    try {
      const ageMatch = ageOptions.find(
        (option) => option.id === formData.ageGroup,
      );

      const incomeRangeMap: Record<string, number> = {
        "Below 1 Lakh": 50000,
        "1-3 Lakh": 200000,
        "3-5 Lakh": 400000,
        "5-8 Lakh": 650000,
        "Above 8 Lakh": 1000000,
        "Prefer not to say": 0,
      };

      const payload = {
        full_name: formData.full_name.trim(),
        age: ageMatch?.value,
        gender: formData.gender,
        state: formData.state,
        education_level: formData.education_level,
        occupation: formData.occupation,
        income_range: formData.income_range,
        annual_income: incomeRangeMap[formData.income_range] || 0,
        category: formData.category,
        user_type: formData.user_type,
        preferred_language: formData.preferred_language,
      };

      await updateProfile(payload);

      const currentUser = await getCurrentUser();

      if (currentUser?.profile_completed === true) {
        router.replace("/dashboard");
        return;
      }

      setMessage(
        "Profile saved. Some required fields may still be incomplete. Please check once again.",
      );
      setSubmitting(false);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Profile save failed. Please try again.",
      );
      setSubmitting(false);
    }
  };

  if (!userReady) {
    return (
      <div className="rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-xl shadow-[#1A3C6E]/10">
        <div className="flex items-center justify-center gap-3 text-[#1A3C6E]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#9BB6E5] border-t-[#1A3C6E]" />
          <p className="text-sm font-medium">Loading profile setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-[#E5E7EB] bg-white shadow-2xl shadow-[#1A3C6E]/10">
      <div className="bg-gradient-to-br from-[#1A3C6E] via-[#245395] to-[#3B82F6] px-5 py-7 text-white sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/75">
              BharatLens Profile
            </p>
            <h1 className="mt-3 text-3xl font-bold">
              Setup your profile easily
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Complete these simple steps to get better schemes, scholarships,
              jobs, exams and benefit recommendations.
            </p>
          </div>

          <span className="w-fit rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/20">
            {progress}% complete
          </span>
        </div>

        <div className="mt-8">
          <div className="flex items-start justify-between">
            {steps.map((step, index) => {
              const active = index === stepIndex;
              const completed = index < stepIndex;

              return (
                <div key={step.title} className="flex flex-1 items-start">
                  <div className="flex min-w-0 flex-col items-center text-center">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-full border-2 text-sm font-bold transition ${
                        active || completed
                          ? "border-white bg-white text-[#1A3C6E]"
                          : "border-white/40 bg-transparent text-white/60"
                      }`}
                    >
                      {completed ? "✓" : index + 1}
                    </div>

                    <p
                      className={`mt-2 hidden max-w-24 text-xs font-semibold sm:block ${
                        active ? "text-white" : "text-white/60"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>

                  {index < steps.length - 1 ? (
                    <div
                      className={`mx-2 mt-5 h-[3px] flex-1 rounded-full ${
                        index < stepIndex ? "bg-white" : "bg-white/25"
                      }`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        <div className="rounded-3xl bg-[#F5F3EE] p-5">
          <p className="text-sm font-semibold text-[#3B82F6]">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#1A3C6E]">
            {currentStep.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[#111827]/65">
            {currentStep.description}
          </p>
        </div>

        <div className="mt-7 space-y-6">
          {stepIndex === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[#111827]">
                  Full name
                </span>
                <input
                  value={formData.full_name}
                  onChange={(event) =>
                    handleSelect("full_name", event.target.value)
                  }
                  placeholder="Enter your full name"
                  className="mt-2 w-full rounded-2xl border border-[#E5E7EB] px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#111827]">
                  Age group
                </span>
                <select
                  value={formData.ageGroup}
                  onChange={(event) =>
                    handleSelect("ageGroup", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  <option value="">Select age group</option>
                  {ageOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#111827]">
                  Gender
                </span>
                <select
                  value={formData.gender}
                  onChange={(event) =>
                    handleSelect("gender", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  <option value="">Select gender</option>
                  {genderOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#111827]">
                  State
                </span>
                <select
                  value={formData.state}
                  onChange={(event) =>
                    handleSelect("state", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  <option value="">Select your state</option>
                  {stateOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {stepIndex === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {userTypeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect("user_type", option)}
                  className={`rounded-3xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-[#3B82F6] hover:shadow-lg ${
                    formData.user_type === option
                      ? "border-[#1A3C6E] bg-[#E5F0FF] text-[#1A3C6E] shadow-md"
                      : "border-[#E5E7EB] bg-white text-[#111827]"
                  }`}
                >
                  <span className="block text-base font-semibold">
                    {option}
                  </span>
                  <span className="mt-2 block text-sm text-[#6B7280]">
                    {option === "Other"
                      ? "Choose this for other needs."
                      : "Choose this if it matches your goal."}
                  </span>
                </button>
              ))}
            </div>
          )}

          {stepIndex === 2 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[#111827]">
                  Education level
                </span>
                <select
                  value={formData.education_level}
                  onChange={(event) =>
                    handleSelect("education_level", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  <option value="">Select education level</option>
                  {educationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#111827]">
                  Occupation
                </span>
                <select
                  value={formData.occupation}
                  onChange={(event) =>
                    handleSelect("occupation", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  <option value="">Select occupation</option>
                  {occupationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {stepIndex === 3 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-[#111827]">
                  Annual income
                </span>
                <select
                  value={formData.income_range}
                  onChange={(event) =>
                    handleSelect("income_range", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  <option value="">Select income range</option>
                  {incomeOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-medium text-[#111827]">
                  Category
                </span>
                <select
                  value={formData.category}
                  onChange={(event) =>
                    handleSelect("category", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {stepIndex === 4 && (
            <div className="grid gap-6">
              <div>
                <p className="mb-3 text-sm font-medium text-[#111827]">
                  Select your interests
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {interestOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleToggleInterest(option)}
                      className={`rounded-3xl border p-4 text-left text-sm font-semibold transition hover:-translate-y-0.5 hover:border-[#3B82F6] hover:shadow-md ${
                        formData.interests.includes(option)
                          ? "border-[#1A3C6E] bg-[#EFF6FF] text-[#1A3C6E]"
                          : "border-[#E5E7EB] bg-white text-[#111827]"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-[#111827]">
                  Preferred language
                </span>
                <select
                  value={formData.preferred_language}
                  onChange={(event) =>
                    handleSelect("preferred_language", event.target.value)
                  }
                  className="mt-2 w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                >
                  {languageOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        {message ? (
          <div className="mt-6 rounded-2xl border border-[#F59E0B]/20 bg-[#FEF3C7] px-4 py-3 text-sm font-medium text-[#92400E]">
            {message}
          </div>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={stepIndex === 0 || submitting}
            className="rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:border-[#1A3C6E] disabled:cursor-not-allowed disabled:opacity-45"
          >
            Back
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="rounded-full bg-[#1A3C6E] px-7 py-3 text-sm font-semibold text-white transition hover:bg-[#3B82F6] disabled:cursor-not-allowed disabled:bg-[#9BB6E5]"
          >
            {submitting
              ? "Saving..."
              : stepIndex === steps.length - 1
                ? "Finish setup"
                : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}