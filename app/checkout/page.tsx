"use client";
import { useState } from "react";


export default function CheckoutPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);


    const startCheckout = async () => {
        setLoading(true); setError(null);
        try {
            const r = await fetch("/api/checkout/session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    // demo SKU — server revalidates the amount
                    name: "Pro Plan (Crypto)", amount: 2000, currency: "usd"
                }),
            });
            if (!r.ok) throw new Error(await r.text());
            const { url } = await r.json();
            window.location.href = url;
        } catch (e: any) {
            setError(e.message || "Failed to create session");
        } finally { setLoading(false); }
    };


    return (
        <main className="max-w-xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-4">Checkout: Pay with Crypto</h1>
            <p className="text-slate-500 mb-6">This demo uses Stripe Checkout with <code>payment_method_types=[&quot;crypto&quot;]</code>. Amounts must be in USD.</p>
            <button onClick={startCheckout} disabled={loading} className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20">
                {loading ? "Redirecting…" : "Pay $20 in USDC"}
            </button>
            {error && <p className="mt-4 text-red-400">{error}</p>}
        </main>
    );
}