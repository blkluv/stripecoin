"use client";


import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoMark from "./LogoMark";


const navLinks = [
    { href: "/", label: "Home" },
    { href: "/onramp", label: "On‑Ramp" },
    { href: "/checkout", label: "Checkout" },
    { href: "/webhooks", label: "Webhooks" },
    { href: "/dashboard", label: "Dashboard" },
];


export default function SiteNav() {
    const pathname = usePathname();
    return (
        <nav className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5">
            <div className="flex items-center gap-3">
                <LogoMark />
                <span className="text-lg font-semibold tracking-tight">Stablecoin Commerce</span>
                <span className="ml-3 rounded-full border border-white/10 px-2 py-0.5 text-xs text-white/70">Stripe demo</span>
            </div>
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
        </nav>
    );
}


function isActive(pathname: string | null, href: string) {
    if (!pathname) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
}


function NavLink({
    href,
    label,
    active,
    }: {
    href: string;
    label: string;
    active?: boolean;
}) {
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