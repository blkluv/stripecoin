export default function Page() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-black via-slate-900 to-slate-950 text-white">
            <section className="max-w-5xl mx-auto px-6 py-16 space-y-10">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight">Stripe Crypto Portfolio</h1>
                <p className="text-lg text-slate-300 max-w-2xl">
                    Accept USDC with Checkout, spin up a fiat-to-crypto onramp, and simulate Connect stablecoin payouts — built with Next.js 15 + Tailwind.
                </p>
                <div className="grid gap-4 sm:grid-cols-2">
                    <a href="/checkout" className="rounded-2xl border border-slate-700 p-6 hover:bg-slate-900">
                        <h3 className="text-xl font-semibold">Pay with Crypto (USDC)</h3>
                        <p className="text-slate-400">Stripe Checkout with Crypto.</p>
                    </a>
                    <a href="/onramp" className="rounded-2xl border border-slate-700 p-6 hover:bg-slate-900">
                        <h3 className="text-xl font-semibold">Fiat → Crypto Onramp</h3>
                        <p className="text-slate-400">Create standalone onramp sessions and compare Quotes by chain.</p>
                    </a>
                    <a href="/connect/onboard" className="rounded-2xl border border-slate-700 p-6 hover:bg-slate-900">
                        <h3 className="text-xl font-semibold">Connect Onboarding</h3>
                        <p className="text-slate-400">Express accounts with capability checks.</p>
                    </a>
                    <a href="/connect/payout" className="rounded-2xl border border-slate-700 p-6 hover:bg-slate-900">
                        <h3 className="text-xl font-semibold">Creator Payout (USDC)</h3>
                        <p className="text-slate-400">Transfers with a stubbed stablecoin payout path.</p>
                    </a>
                </div>
            </section>
        </main>
    );
}