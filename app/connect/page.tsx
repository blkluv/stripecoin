
"use client";
import { useState } from "react";

export default function ConnectPage() {
  const [email, setEmail] = useState("");
  const [accountId, setAccountId] = useState<string | null>(null);
  const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);

  async function createAccount() {
    const res = await fetch("/api/connect/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to create account");
    setAccountId(data.accountId);
  }

  async function startOnboarding() {
    if (!accountId) return;
    const res = await fetch("/api/connect/account-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId }),
    });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Failed to create account link");
    setOnboardingUrl(data.url);
    window.location.href = data.url;
  }

  return (
    <div className="max-w-xl mx-auto p-6 grid gap-4">
      <h1 className="text-2xl font-semibold">Connect: onboard a seller</h1>
      <label className="grid gap-1 text-sm">
        <span>Email (optional)</span>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seller@example.com" className="border rounded-lg px-3 py-2" />
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        <button onClick={createAccount} className="rounded-xl bg-black text-white py-3">Create test account</button>
        <button onClick={startOnboarding} disabled={!accountId} className="rounded-xl bg-white border py-3 disabled:opacity-50">Start onboarding</button>
      </div>
      {accountId && (
        <div className="text-xs text-gray-600">Connected account: <code>{accountId}</code></div>
      )}
    </div>
  );
}
