"use client";

import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, LogIn, LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";
import { VButton } from "@/components/voyage/primitives";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth/AuthContext";
import { AuthDialog } from "@/components/auth/AuthDialog";

const navItems = [
  { label: "Discover", href: "/discover" },
  { label: "Plan Trip", href: "/planner" },
  { label: "My Trips", href: "/trips" },
  { label: "Layover", href: "/layover" },
  { label: "Visa", href: "/visa" },
  { label: "Budget", href: "/budget" },
  { label: "Profile", href: "/profile" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-all duration-300",
        scrolled || mobileOpen
          ? "border-white/10 bg-[#07101d]/90 shadow-[0_12px_40px_rgba(0,0,0,0.28)] backdrop-blur-2xl"
          : "border-transparent bg-[#07101d]/45 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <Link to="/" aria-label="Voyage Weaver home" className="flex shrink-0 items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
            <img src="/voyage-mark.svg" alt="" className="h-5 w-5" />
          </span>
          <span className="hidden text-sm font-semibold tracking-[0.18em] text-white sm:block">VOYAGE</span>
        </Link>

        <nav className="hidden flex-1 items-center justify-center lg:flex" aria-label="Primary navigation">
          <div className="flex items-center gap-1 rounded-2xl border border-white/10 bg-white/[0.035] p-1.5">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative rounded-xl px-3.5 py-2 text-[13px] font-medium tracking-wide transition-all duration-200",
                  isActive(item.href)
                    ? "bg-cyan-300/15 text-cyan-100 shadow-[inset_0_0_0_1px_rgba(103,232,249,0.16)]"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 bottom-1 h-px rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.9)]" />
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <Link to="/profile" className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/[0.06]">
                <User className="size-4" /> {user.full_name.split(" ")[0]}
              </Link>
              <button onClick={signOut} className="rounded-xl p-2 text-slate-300 hover:bg-white/[0.06] hover:text-white" title="Sign out"><LogOut className="size-4" /></button>
            </>
          ) : (
            <button onClick={() => setAuthOpen(true)} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-200 hover:bg-white/[0.06]"><LogIn className="size-4" /> Sign in</button>
          )}
          <Link to="/planner" aria-label="Plan your journey"><VButton size="sm" magnetic>Plan Your Journey</VButton></Link>
        </div>

        <button
          type="button"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-100 transition hover:bg-white/[0.08] lg:hidden"
          aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} />
      {mobileOpen && (
        <div className="border-t border-white/10 bg-[#07101d]/98 px-4 py-4 backdrop-blur-2xl lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-1" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "rounded-xl px-4 py-3 text-sm transition",
                  isActive(item.href)
                    ? "bg-cyan-300/15 text-cyan-100"
                    : "text-slate-300 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                {item.label}
              </Link>
            ))}
            {!user ? <button onClick={() => setAuthOpen(true)} className="mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-slate-200"><LogIn className="size-4" /> Sign in or create account</button> : <button onClick={signOut} className="mt-2 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-left text-sm text-slate-200"><LogOut className="size-4" /> Sign out</button>}
            <Link to="/planner" className="mt-2"><VButton className="w-full" size="sm">Plan Your Journey</VButton></Link>
          </nav>
        </div>
      )}
    </header>
  );
}
