"use client";
import { useState } from "react";


export default function PayoutPage() {
    const [account, setAccount] = useState("");
    const [amount, setAmount] = useState(5000); // $50
    const [msg, setMsg] = useState<string | null>(null);


    const send = async () => {
        setMsg(null);
        const r = await fetch("/api/connect/transfer", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ account, amount }) });
        const j = await r.json();
        setMsg(r.ok ? `Transfer ${j.id} → ${j.status}` : `Error: ${j.error}`);
    };


    return (
        <main className="max-w-xl mx-auto p-6 space-y-3">
            <h1 className="text-3xl font-bold">Creator Payout</h1>
            <input value={account} onChange={e=>setAccount(e.target.value)} placeholder="acct_..." className="w-full rounded-xl bg-black/40 p-2 border border-slate-700"/>
            <input type="number" value={amount} onChange={e=>setAmount(parseInt(e.target.value||"0",10))} className="w-full rounded-xl bg-black/40 p-2 border border-slate-700"/>
            <button onClick={send} className="px-4 py-2 rounded-xl bg-white/10">Send $</button>
            {msg && <p className="text-slate-400">{msg}</p>}
        </main>
    );
}