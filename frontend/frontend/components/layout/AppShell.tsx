"use client";

import { usePathname } from "next/navigation";
import SiteFooter from "@/components/layout/SiteFooter";
import SiteHeader from "@/components/layout/SiteHeader";

interface AppShellProps {
  children: React.ReactNode;
}

const HIDE_CHROME_PREFIXES = ["/admin", "/login", "/register", "/forgot-password", "/reset-password"];

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const shouldHideChrome = HIDE_CHROME_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return (
    <>
      {!shouldHideChrome ? <SiteHeader /> : null}
      <div className="flex-1">{children}</div>
      {!shouldHideChrome ? <SiteFooter /> : null}
    </>
  );
}
