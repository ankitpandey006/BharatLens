import { Suspense } from "react";
import LoginForm from "@/components/forms/LoginForm";

function LoginFormFallback() {
  return (
    <div className="w-full max-w-md rounded-3xl border border-[#E5E7EB] bg-white p-8 shadow-lg">
      <div className="flex items-center justify-center gap-3 py-8">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#9BB6E5] border-t-[#1A3C6E]" />
        <p className="text-sm font-medium text-[#1A3C6E]">Loading...</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFormFallback />}>
      <LoginForm />
    </Suspense>
  );
}
