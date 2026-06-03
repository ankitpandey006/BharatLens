"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "@/lib/api/auth";

const steps = [
  {
    title: "Basic details",
    description: "Tell BharatLens who the recommendations are for.",
    fields: ["Full name", "Age group", "Primary goal"],
  },
  {
    title: "Location",
    description: "State and district help match local benefits and alerts.",
    fields: ["State", "District", "Pin code"],
  },
  {
    title: "User type",
    description: "Choose the profile that best describes your current needs.",
    fields: ["Student, job seeker, farmer, entrepreneur, citizen"],
  },
  {
    title: "Education / income",
    description: "These signals improve eligibility matching.",
    fields: ["Education level", "Occupation", "Income range"],
  },
  {
    title: "Preferences",
    description: "Set alerts, language, and areas of interest.",
    fields: ["Language", "Notification preference", "Interested categories"],
  },
];

export default function ProfileSetupWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [message, setMessage] = useState("");
  const currentStep = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  const finishSetup = async () => {
    try {
      await updateProfile({ profile_completed: true });
      router.replace("/dashboard");
    } catch (error: any) {
      setMessage(error?.message || "Failed to save profile settings. Please try again.");
    }
  };

  const goNext = async () => {
    setMessage("");

    if (stepIndex === steps.length - 1) {
      await finishSetup();
      return;
    }

    setMessage("");
    setStepIndex((value) => Math.min(value + 1, steps.length - 1));
  };

  return (
    <div className="rounded-3xl border border-[#E5E7EB] bg-white p-5 shadow-xl shadow-[#1A3C6E]/10 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#3B82F6]">
            Profile setup
          </p>
          <h1 className="mt-3 text-3xl font-bold text-[#1A3C6E]">
            {currentStep.title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-[#111827]/65">
            {currentStep.description}
          </p>
        </div>
        <span className="w-fit rounded-full bg-[#F5F3EE] px-4 py-2 text-sm font-semibold text-[#1A3C6E]">
          Step {stepIndex + 1} of {steps.length}
        </span>
      </div>

      <div className="mt-7">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-[#111827]/55">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-3 rounded-full bg-[#F5F3EE]">
          <div
            className="h-3 rounded-full bg-[#1A3C6E] transition-[width] duration-200 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {currentStep.fields.map((field) => (
          <div key={field}>
            <label className="mb-1.5 block text-sm font-medium text-[#111827]">
              {field}
            </label>
            <input
              type="text"
              placeholder={`Enter ${field.toLowerCase()}`}
              className="w-full rounded-2xl border border-[#E5E7EB] bg-white px-4 py-3 text-sm outline-none transition-colors duration-150 focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
            />
          </div>
        ))}
      </div>

      {message ? (
        <p className="mt-5 rounded-2xl bg-[#F5F3EE] px-4 py-3 text-sm text-[#1A3C6E]">
          {message}
        </p>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
          disabled={stepIndex === 0}
          className="rounded-full border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:border-[#1A3C6E] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Back
        </button>
        <button
          type="button"
          onClick={goNext}
          className="rounded-full bg-[#1A3C6E] px-6 py-3 text-sm font-semibold text-white transition-[color,background-color,border-color,text-decoration-color,fill,stroke,transform] duration-200 hover:bg-[#3B82F6]"
        >
          {stepIndex === steps.length - 1 ? "Finish setup" : "Continue"}
        </button>
      </div>
    </div>
  );
}
