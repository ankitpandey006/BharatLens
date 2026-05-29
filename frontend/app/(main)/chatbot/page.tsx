import { Bot, Send } from "lucide-react";

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-[#F5F3EE] px-5 py-8">
      <section className="mx-auto max-w-4xl rounded-3xl border border-[#E5E7EB] bg-white shadow-sm">
        <div className="border-b border-[#E5E7EB] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1A3C6E] text-white">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A3C6E]">
                BharatLens AI Assistant
              </h1>
              <p className="text-sm text-[#111827]/60">
                Ask about schemes, jobs, scholarships, and exams.
              </p>
            </div>
          </div>
        </div>

       <div className="h-96 space-y-4 p-5">
          <div className="max-w-[80%] rounded-2xl bg-[#F5F3EE] p-4 text-sm text-[#111827]/75">
            Hello 👋 How can I help you today?
          </div>

          <div className="ml-auto max-w-[80%] rounded-2xl bg-[#1A3C6E] p-4 text-sm text-white">
            Which schemes match my profile?
          </div>

          <div className="max-w-[80%] rounded-2xl bg-[#F5F3EE] p-4 text-sm text-[#111827]/75">
            I can help you find eligible schemes based on your profile details.
          </div>
        </div>

        <div className="border-t border-[#E5E7EB] p-4">
          <div className="flex items-center gap-3 rounded-2xl border border-[#E5E7EB] bg-[#F5F3EE] px-4 py-3">
            <input
              type="text"
              placeholder="Ask BharatLens AI..."
              className="w-full bg-transparent text-sm text-[#111827] outline-none placeholder:text-[#111827]/40"
            />
            <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1A3C6E] text-white transition hover:bg-[#3B82F6]">
              <Send size={17} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}