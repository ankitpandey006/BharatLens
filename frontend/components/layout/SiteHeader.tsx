"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Bell,
  User as UserIcon,
  Menu,
  X,
  ChevronDown,
  LayoutDashboard,
  Bookmark,
  FileText,
  Award,
  Briefcase,
  BookOpen,
  LogOut,
  Home,
  Compass,
  Bot,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const exploreLinks = [
  { href: "/schemes", label: "Schemes", icon: FileText },
  { href: "/scholarships", label: "Scholarships", icon: Award },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/exams", label: "Exams", icon: BookOpen },
];

const profileLinks = [
  { href: "/profile", label: "My Profile", icon: UserIcon },
];

function isActive(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function SiteHeader() {
  const pathname = usePathname();
  const { isAuthenticated, signOut, isSigningOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const exploreDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const showAuthenticatedNav = isAuthenticated;

  useEffect(() => {
    const updateScroll = () => setIsScrolled(window.scrollY > 8);

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });

    return () => window.removeEventListener("scroll", updateScroll);
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setIsMenuOpen(false);
      setIsExploreOpen(false);
      setIsProfileOpen(false);
    }, 0);

    return () => window.clearTimeout(id);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exploreDropdownRef.current &&
        !exploreDropdownRef.current.contains(event.target as Node)
      ) {
        setIsExploreOpen(false);
      }

      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsExploreOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    await signOut();
  };

  const navLinkClass = (href: string) => {
    const active = isActive(pathname, href);

    return `relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-300 ease-out group ${
      active ? "text-[#3B82F6]" : "text-[#111827]/70 hover:text-[#3B82F6]"
    }`;
  };

  const navUnderlineClass = (href: string) => {
    const active = isActive(pathname, href);

    return `absolute bottom-0 left-0 h-0.5 bg-linear-to-r from-[#3B82F6] to-[#3B82F6] transition-all duration-300 ease-out ${
      active ? "w-full" : "w-0 group-hover:w-full"
    }`;
  };

  const headerClass = `sticky top-0 z-[70] border-b transition-all duration-300 ease-out pointer-events-auto ${
    isScrolled
      ? "border-[#E5E7EB]/60 bg-[#FFFFFF]/80 shadow-md backdrop-blur-lg"
      : "border-[#E5E7EB]/20 bg-[#F5F3EE]/70 backdrop-blur-md"
  }`;

  return (
    <header className={headerClass}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="/"
          prefetch={false}
          className="group flex min-w-0 items-center gap-2 transition-all duration-300 ease-out hover:scale-[1.02]"
        >
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-[#1A3C6E] to-[#3B82F6] text-sm font-bold text-white shadow-lg transition-all duration-300 ease-out group-hover:shadow-xl">
            <Sparkles
              size={18}
              className="absolute inset-0 m-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
            <span className="transition-opacity duration-300 group-hover:opacity-0">
              BL
            </span>
          </span>

          <span className="min-w-0">
            <span className="block truncate text-lg font-bold leading-none text-[#111827] transition-colors duration-300">
              BharatLens
            </span>
            <span className="mt-1 block truncate text-xs font-medium text-[#111827]/60 transition-colors duration-300">
              AI Government Discovery
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {showAuthenticatedNav ? (
            <>
              <Link href="/dashboard" prefetch={false} className={navLinkClass("/dashboard")}>
                <LayoutDashboard
                  size={18}
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
                <span>Dashboard</span>
                <div className={navUnderlineClass("/dashboard")} />
              </Link>

              <div ref={exploreDropdownRef} className="group relative">
                <button
                  type="button"
                  onClick={() => setIsExploreOpen((value) => !value)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#111827]/70 transition-all duration-300 ease-out hover:text-[#3B82F6]"
                >
                  <Compass
                    size={18}
                    className="transition-transform duration-300 ease-out group-hover:scale-110"
                  />
                  <span>Explore</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ease-out ${
                      isExploreOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <div
                  className={`absolute left-0 top-full z-50 mt-3 max-h-[70vh] w-56 overflow-y-auto rounded-2xl border border-[#E5E7EB]/60 bg-white/95 p-2 shadow-2xl backdrop-blur-sm transition-all duration-200 ease-out ${
                    isExploreOpen
                      ? "visible scale-100 opacity-100"
                      : "invisible scale-95 opacity-0 pointer-events-none"
                  } group-hover:visible group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto`}
                >
                  {exploreLinks.map((link) => {
                    const IconComponent = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch={false}
                        className="group/item flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[#111827]/70 transition-all duration-300 ease-out hover:bg-[#3B82F6]/5 hover:text-[#3B82F6]"
                      >
                        <IconComponent
                          size={16}
                          className="transition-transform duration-300 ease-out group-hover/item:scale-110"
                        />
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <Link href="/chatbot" prefetch={false} className={navLinkClass("/chatbot")}>
                <Bot
                  size={18}
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
                <span>Ask AI</span>
                <div className={navUnderlineClass("/chatbot")} />
              </Link>

              <Link href="/saved" prefetch={false} className={navLinkClass("/saved")}>
                <Bookmark
                  size={18}
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
                <span>Saved</span>
                <div className={navUnderlineClass("/saved")} />
              </Link>

              <Link
                href="/notifications"
                prefetch={false}
                className={navLinkClass("/notifications")}
              >
                <div className="relative">
                  <Bell
                    size={18}
                    className="transition-transform duration-300 ease-out group-hover:scale-110"
                  />
                  <span className="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-red-500 shadow-lg" />
                </div>
                <span>Notifications</span>
                <div className={navUnderlineClass("/notifications")} />
              </Link>

              <div ref={profileDropdownRef} className="group relative ml-2">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-full border border-[#E5E7EB]/60 bg-white/50 px-4 py-2 text-sm font-semibold text-[#111827] shadow-sm transition-all duration-300 ease-out hover:scale-105 hover:border-[#3B82F6]/40 hover:bg-white hover:shadow-md"
                >
                  <UserIcon
                    size={18}
                    className="transition-transform duration-300 ease-out group-hover:scale-110"
                  />
                  <span>Profile</span>
                </button>

                <div
                  className={`absolute right-0 top-full z-50 mt-3 max-h-[70vh] w-56 overflow-y-auto rounded-2xl border border-[#E5E7EB]/60 bg-white/95 p-2 shadow-2xl backdrop-blur-sm transition-all duration-200 ease-out ${
                    isProfileOpen
                      ? "visible scale-100 opacity-100"
                      : "invisible scale-95 opacity-0 pointer-events-none"
                  } group-hover:visible group-hover:scale-100 group-hover:opacity-100 group-hover:pointer-events-auto`}
                >
                  {profileLinks.map((link) => {
                    const IconComponent = link.icon;

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        prefetch={false}
                        className="group/item flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm text-[#111827]/70 transition-all duration-300 ease-out hover:bg-[#3B82F6]/5 hover:text-[#3B82F6]"
                      >
                        <IconComponent
                          size={16}
                          className="transition-transform duration-300 ease-out group-hover/item:scale-110"
                        />
                        {link.label}
                      </Link>
                    );
                  })}

                  <div className="my-2 border-t border-[#E5E7EB]/40" />

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isSigningOut}
                    className={`group/item flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all duration-300 ease-out ${
                      isSigningOut
                        ? "cursor-not-allowed bg-red-100 text-red-400"
                        : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <LogOut
                      size={16}
                      className="transition-transform duration-300 ease-out group-hover/item:scale-110"
                    />
                    {isSigningOut ? "Logging out..." : "Logout"}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link href="/" prefetch={false} className={navLinkClass("/")}>
                <Home
                  size={18}
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
                <span>Home</span>
                <div className={navUnderlineClass("/")} />
              </Link>

              <Link href="/about" prefetch={false} className={navLinkClass("/about")}>
                <span>About</span>
                <div className={navUnderlineClass("/about")} />
              </Link>

              <Link href="/login" prefetch={false} className={navLinkClass("/login")}>
                <span>Login</span>
                <div className={navUnderlineClass("/login")} />
              </Link>

              <Link
                href="/register"
                prefetch={false}
                className="rounded-full bg-linear-to-r from-[#1A3C6E] to-[#3B82F6] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:shadow-xl"
              >
                Get Started
              </Link>
            </>
          )}
        </nav>

        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setIsMenuOpen((value) => !value)}
          className="group pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#E5E7EB]/60 bg-white/50 text-[#111827] shadow-sm transition-all duration-300 ease-out hover:scale-105 hover:border-[#3B82F6]/40 hover:bg-white hover:shadow-md lg:hidden"
        >
          {isMenuOpen ? (
            <X size={20} className="transition-transform duration-300" />
          ) : (
            <Menu size={20} className="transition-transform duration-300" />
          )}
        </button>
      </div>

      {isMenuOpen && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-[#E5E7EB]/60 bg-white/95 px-4 py-4 shadow-2xl backdrop-blur-sm lg:hidden">
          <div className="grid gap-2">
            {(showAuthenticatedNav
              ? [
                  {
                    href: "/dashboard",
                    label: "Dashboard",
                    icon: LayoutDashboard,
                  },
                  { href: "/chatbot", label: "Ask AI", icon: Bot },
                  { href: "/saved", label: "Saved", icon: Bookmark },
                  { href: "/notifications", label: "Notifications", icon: Bell },
                  { href: "/profile", label: "Profile", icon: UserIcon },
                ]
              : [
                  { href: "/", label: "Home", icon: Home },
                  { href: "/about", label: "About", icon: null },
                ]
            ).map((link, idx) => {
              const active = isActive(pathname, link.href);
              const IconComponent = link.icon;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  onClick={() => setIsMenuOpen(false)}
                  style={{
                    animation: `slideIn 0.3s ease-out ${idx * 0.05}s backwards`,
                  }}
                  className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300 ease-out ${
                    active
                      ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                      : "text-[#111827]/70 hover:bg-[#3B82F6]/5 hover:text-[#3B82F6]"
                  }`}
                >
                  {IconComponent && (
                    <IconComponent
                      size={18}
                      className="transition-transform duration-300 ease-out group-hover:scale-110"
                    />
                  )}
                  {link.label}
                </Link>
              );
            })}

            <div className="my-2 border-t border-[#E5E7EB]/40" />

            <div className="rounded-2xl border border-[#E5E7EB]/40 bg-[#F5F3EE]/30 p-3">
              <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#111827]/50">
                Explore
              </p>

              {exploreLinks.map((link, idx) => {
                const IconComponent = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    prefetch={false}
                    onClick={() => setIsMenuOpen(false)}
                    style={{
                      animation: `slideIn 0.3s ease-out ${(idx + 5) * 0.05}s backwards`,
                    }}
                    className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#111827]/70 transition-all duration-300 ease-out hover:bg-[#3B82F6]/5 hover:text-[#3B82F6]"
                  >
                    <IconComponent
                      size={16}
                      className="transition-transform duration-300 ease-out group-hover:scale-110"
                    />
                    {link.label}
                  </Link>
                );
              })}
            </div>

            <div className="my-2 border-t border-[#E5E7EB]/40" />

            {showAuthenticatedNav ? (
              <button
                type="button"
                onClick={handleLogout}
                disabled={isSigningOut}
                className={`group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 ease-out ${
                  isSigningOut
                    ? "cursor-not-allowed bg-red-100 text-red-400"
                    : "bg-red-50 text-red-600 hover:bg-red-100"
                }`}
              >
                <LogOut
                  size={18}
                  className="transition-transform duration-300 ease-out group-hover:scale-110"
                />
                {isSigningOut ? "Logging out..." : "Logout"}
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  prefetch={false}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl border border-[#E5E7EB]/60 bg-white/50 px-4 py-3 text-center text-sm font-semibold text-[#111827] transition-all duration-300 ease-out hover:border-[#3B82F6]/40 hover:bg-white hover:text-[#3B82F6]"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  prefetch={false}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-xl bg-linear-to-r from-[#1A3C6E] to-[#3B82F6] px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all duration-300 ease-out hover:shadow-xl"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        :global(.overflow-y-auto) {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.4) transparent;
        }

        :global(.overflow-y-auto::-webkit-scrollbar) {
          width: 6px;
        }

        :global(.overflow-y-auto::-webkit-scrollbar-track) {
          background: transparent;
        }

        :global(.overflow-y-auto::-webkit-scrollbar-thumb) {
          background-color: rgba(59, 130, 246, 0.4);
          border-radius: 3px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        :global(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
          background-color: rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </header>
  );
}
