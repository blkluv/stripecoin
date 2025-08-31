import LogoMark from "./LogoMark";


export default function SiteFooter() {
    return (
        <footer className="relative z-10 border-t border-white/10 bg-black/20">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
                <div className="flex items-center gap-3 text-white/70">
                    <LogoMark small />
                    <span className="text-sm">Built with Next.js • Tailwind • Stripe • By Gunner Howe</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-white/60">
                    <Tag>USDC</Tag>
                    <Tag>RLUSD</Tag>
                    <Tag>XRP (concept)</Tag>
                    <Tag>ETH</Tag>
                </div>
            </div>
        </footer>
    );
}


function Tag({ children }: { children: React.ReactNode }) {
    return <span className="rounded-md border border-white/10 px-2 py-1">{children}</span>;
}