"use client";

export default function SettingsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#1A3C6E] sm:text-3xl">Settings</h1>
        <p className="mt-2 text-[#111827]/60">
          Configure system and verification parameters
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">
            Verification Thresholds
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-[#111827]/70">Minimum AI Confidence:</span>
              <span className="font-medium text-[#1A3C6E]">60%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#111827]/70">Minimum Trust Score:</span>
              <span className="font-medium text-[#1A3C6E]">70%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#111827]/70">Auto-approve items above:</span>
              <span className="font-medium text-[#1A3C6E]">95%</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6">
          <h3 className="mb-4 font-semibold text-[#1A3C6E]">
            Notification Settings
          </h3>
          <div className="space-y-3">
            <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-4 rounded-lg px-1">
              <span className="text-[#111827]/70">Alert on low confidence</span>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </label>
            <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-4 rounded-lg px-1">
              <span className="text-[#111827]/70">Daily summary email</span>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </label>
            <label className="flex min-h-[44px] cursor-pointer items-center justify-between gap-4 rounded-lg px-1">
              <span className="text-[#111827]/70">Fraud alerts</span>
              <input type="checkbox" defaultChecked className="h-5 w-5" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
