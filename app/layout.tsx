import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { OriginGuard } from "@/components/auth/OriginGuard";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "BharatLens",
  description:
    "AI-powered access to Indian government schemes, scholarships, jobs, and public information.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <OriginGuard />
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
