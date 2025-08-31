"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function OnrampConfirmPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const id = sp.get("id") || "";
  const network = sp.get("network") || "";
  const currency = sp.get("currency") || "";
  const dest_amount = sp.get("dest_amount") || "";
  const source_total_amount = sp.get("source_total_amount") || "";

  async function startOnramp() {
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await fetch("/api/onramp/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, network, currency, dest_amount, source_total_amount }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      if (json.url) {
        window.location.href = json.url;
        return;
      }
      if (json.next) {
        router.push(json.next);
        return;
      }
      setMsg("On-ramp session created, but no redirect URL was returned.");
    } catch (e: any) {
      setMsg(e?.message || "Failed to start on‑ramp.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-[calc(100vh-8rem)] bg-neutral-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-10 md:py-14">
        <h1 className="text-2xl font-semibold">Confirm on‑ramp</h1>
        <p className="mt-2 text-white/70">Review and proceed to the hosted on‑ramp (or simulated flow if not enabled).</p>
        <div className="mt-6 space-y-2 text-sm">
          <Row label="Network" value={network} />
          <Row label="Asset" value={currency.toUpperCase()} />
          <Row label="You receive" value={`${dest_amount} ${currency.toUpperCase()}`} />
          <Row label="You pay" value={`$${source_total_amount}`} />
          <Row label="Quote ID" value={id} mono />
        </div>
        {msg && <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{msg}</div>}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={ () => startOnramp()}
            disabled={submitting}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-xl transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Starting…" : "Start on-ramp"}
          </button>
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            Go back
          </button>
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-white/60">{label}</span>
      <span className={`text-white/90 ${mono ? "font-mono break-all" : ""}`}>{value}</span>
    </div>
  );
}