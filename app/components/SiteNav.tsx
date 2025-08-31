// components/SiteNav.tsx — responsive nav with hamburger + home links
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LogoMark from "./LogoMark";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/onramp", label: "On-Ramp" },
  { href: "/checkout", label: "Checkout" },
/*   { href: "/webhooks", label: "Webhooks" }, */
  { href: "/dashboard", label: "Dashboard" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock scroll while the mobile menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="relative z-20 w-full bg-transparent">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
        {/* Brand — clicking title or badge goes home */}
        <div className="flex items-center gap-3">
          <Link href="/" className="rounded focus:outline-none focus:ring-2 focus:ring-white/50">
            <LogoMark />
          </Link>
          <Link href="/" className="flex items-center gap-3 rounded focus:outline-none focus:ring-2 focus:ring-white/50">
            <span className="text-lg font-semibold tracking-tight">Stablecoin Commerce</span>
            <span className="rounded-full border border-white/10 text-center px-2 py-0.5 text-xs text-white/70">Stripe demo</span>
          </Link>
        </div>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <NavLink key={href} href={href} label={label} active={isActive(pathname, href)} />
          ))}
          <a
            className="ml-2 rounded-lg border border-white/15 px-3 py-1.5 text-sm text-white/80 transition hover:bg-white/5"
            href="https://github.com/gunnerhowe/stripe-stablecoin-app"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="ml-10 inline-flex size-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10 md:hidden"
        >
          <BurgerIcon open={open} />
        </button>
      </nav>

      {/* Mobile menu overlay */}
      {(
        <div
          id="mobile-menu"
          className={`md:hidden fixed inset-0 z-30 transition ${
            open ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${
              open ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => setOpen(false)}
          />

          {/* Sheet */}
          <div
            className={`absolute right-3 left-3 top-3 origin-top rounded-2xl border border-white/10 bg-neutral-950/95 p-3 shadow-2xl transition-[transform,opacity] ${
              open ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
            }`}
          >
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <LogoMark small />
                <span className="text-sm font-semibold">Stablecoin Commerce</span>
              </Link>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-white/90 transition hover:bg-white/10"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mt-2 h-px bg-white/10" />
            <div className="mt-2 grid">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 ${
                    isActive(pathname, href) ? "bg-white text-black font-semibold" : "text-white/90"
                  }`}
                >
                  {label}
                </Link>
              ))}
              <a
                href="https://github.com/gunnerhowe/stripe-stablecoin-app"
                target="_blank"
                rel="noreferrer"
                className="mt-1 rounded-lg px-3 py-2 text-sm text-white/90 transition hover:bg-white/5"
              >
                GitHub ↗
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

function NavLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={
        "rounded-lg px-3 py-1.5 text-sm transition " +
        (active ? "bg-white text-black font-semibold" : "text-white/80 hover:bg-white/5 hover:text-white")
      }
    >
      {label}
    </Link>
  );
}

function BurgerIcon({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" />
      ) : (
        <>
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </>
      )}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
