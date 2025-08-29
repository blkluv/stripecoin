"use client"
import { useState, useEffect } from "react";


export default function OnrampPage() {
    const [quotes, setQuotes] = useState<any[]>([]);


    useEffect(() => {
        fetch("/api/onramp/quotes?amount=200").then(r => r.json()).then((q) => setQuotes(q.data ?? []));
    }, []);


    const startOnramp = async (network: string) => {
        const r = await fetch("/api/onramp/session", { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ destination_currency: "usdc", destination_network: network }) });
        const { redirect_url } = await r.json();
        window.location.href = redirect_url;
    };


    return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Fiat → Crypto Onramp</h1>
        <p className="text-slate-500">Compare quotes for USDC on Ethereum vs Solana, then redirect to crypto.link.com.</p>
        <div className="rounded-2xl border border-slate-700 overflow-hidden">
            <table className="w-full text-sm">
                <thead className="bg-slate-900/40">
                    <tr><th className="text-left p-3">Network</th><th className="text-left p-3">Rate</th><th className="text-left p-3">Action</th></tr>
                </thead>
                <tbody>
                    {quotes.map((q) => (
                    <tr key={q.id} className="border-t border-slate-800">
                        <td className="p-3 capitalize">{q.destination_network}</td>
                        <td className="p-3">{q.destination_amount} {q.destination_currency.toUpperCase()}</td>
                        <td className="p-3">
                            <button onClick={() => startOnramp(q.destination_network)} className="px-3 py-1 rounded-lg bg-white/10">Buy</button>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </main>
    );
}