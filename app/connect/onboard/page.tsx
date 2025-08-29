"use client";
import { useState } from "react";


export default function Onboard() {
    const [account, setAccount] = useState<string | null>(null);


    const create = async () => {
        const r = await fetch("/api/connect/create-account", { method: "POST" });
        const { id } = await r.json();
        setAccount(id);
    };


    const link = async () => {
        if (!account) return;
        const r = await fetch("/api/connect/create-account-link", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ account }) });
        const { url } = await r.json();
        window.location.href = url;
    };


    return (
        <main className="max-w-xl mx-auto p-6 space-y-4">
            <h1 className="text-3xl font-bold">Connect Onboarding</h1>
            <button onClick={create} className="px-3 py-2 rounded-xl bg-white/10">Create Express Account</button>
                {account && (
            <div className="p-4 border border-slate-700 rounded-xl">
                <p className="text-sm text-slate-400">Account: {account}</p>
                <button onClick={link} className="mt-3 px-3 py-2 rounded-xl bg-white/10">Open Onboarding</button>
            </div>
            )}
        </main>
    );
}