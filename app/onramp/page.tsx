// /app/onramp/page.tsx
"use client";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";

type Fees = {
  network_fee_monetary?: string;
  transaction_fee_monetary?: string;
} | null;

type Quote = {
  id: string;
  destination_network: string;   // "ethereum" | "solana" | ...
  destination_currency: string;  // "usdc" | "eth" | ...
  destination_amount: string;    // e.g. "200.00"
  source_total_amount: string;   // e.g. "212.71" (includes fees)
  fees: Fees;
};

const API_PATH = "/api/onramp/quotes"; // change to "/api/quotes" if your route lives there
const DEFAULT_NETWORKS = "ethereum,solana";

function usd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
function num(s?: string) {
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
function fmtUnits(n: number, max = 8) {
  return n.toLocaleString(undefined, { maximumFractionDigits: max });
}

export default function OnrampPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [asset, setAsset] = useState<string>("usdc");
  const [enterAmount, setEnterAmount] = useState<number>(200.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastReqId = useRef(0);

  // Reusable fetcher
  const getQuotes = useCallback(
    async (opts?: { amount?: number; assets?: string; networks?: string }) => {
      const id = ++lastReqId.current;

      // Use given overrides or current UI state
      const amountNum = Number.isFinite(opts?.amount ?? enterAmount)
        ? (opts?.amount ?? enterAmount)
        : 200;
      const assets = (opts?.assets ?? (asset || "usdc")).toLowerCase();
      const networks = (opts?.networks ?? DEFAULT_NETWORKS).toLowerCase();

      const params = new URLSearchParams();
      params.set("amount", amountNum.toFixed(2));
      params.set("destination_currencies", assets);
      if (networks) params.set("destination_networks", networks);

      setLoading(true);
      setError(null);

      try {
        const r = await fetch(`${API_PATH}?${params.toString()}`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const body = (await r.json()) as { data?: Quote[] };

        if (id !== lastReqId.current) return; // drop stale response
        setQuotes(Array.isArray(body.data) ? body.data : []);
      } catch (e: unknown) {
        if (id !== lastReqId.current) return;
        setQuotes([]);
        setError(e instanceof Error ? e.message : "Failed to fetch quotes");
      } finally {
        if (id === lastReqId.current) setLoading(false);
      }
    },
    [asset, enterAmount]
  );

  // Initial load
  useEffect(() => {
    void getQuotes();
  }, [getQuotes]);

  // Derived + sorted rows (cheapest first by units per $1)
  const rows = useMemo(() => {
    const enriched = quotes.map((q) => {
      const destAmt = num(q.destination_amount);
      const totalUsd = num(q.source_total_amount);
      const netFee = num(q.fees?.network_fee_monetary);
      const txFee = num(q.fees?.transaction_fee_monetary);
      const unitsPerUsd = totalUsd > 0 ? destAmt / totalUsd : 0;
      return { ...q, destAmt, totalUsd, netFee, txFee, unitsPerUsd };
    });
    return enriched
      .filter((r) => r.destination_currency === asset)
      .sort((a, b) => b.unitsPerUsd - a.unitsPerUsd);
  }, [quotes, asset]);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Fiat → Crypto Onramp</h1>
          <p className="text-slate-500">
            Compare quotes by network. We show destination amount, fees, and total USD you pay.
          </p>
        </div>
        <div className="inline-flex rounded-xl border border-slate-700 p-1 bg-slate-900/50">
          {(["usdc", "eth"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setAsset(c)}
              className={`px-3 py-1 rounded-lg ${
                asset === c ? "bg-white/10" : "hover:bg-white/5"
              } cursor-pointer`}
            >
              {c.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <div className="flex items-center gap-3">
        <label htmlFor="amount" className="text-2xl font-bold">
          Amount:
        </label>
        <label htmlFor="amount" className="text-2xl font-bold">
          $
        </label>
        <input
          id="amount"
          type="number"
          inputMode="decimal"
          value={Number.isFinite(enterAmount) ? enterAmount : 200}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setEnterAmount(Number.isFinite(v) ? v : 0);
          }}
          placeholder="200.00"
          className="rounded-lg border border-slate-700 p-2 w-40 bg-transparent text-center"
        />
        <button
          onClick={() => getQuotes()}
          disabled={loading || !Number.isFinite(enterAmount) || enterAmount <= 0}
          aria-busy={loading}
          className="ml-1 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Refreshing…" : "Get Quotes"}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm" role="status">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-900/40">
            <tr>
              <th className="text-left p-3">Network</th>
              <th className="text-right p-3">You get</th>
              <th className="text-right p-3">Network fee</th>
              <th className="text-right p-3">Transaction fee</th>
              <th className="text-right p-3">Total you pay</th>
              <th className="text-right p-3">Units per $1</th>
              <th className="text-right p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q) => (
              <tr key={q.id} className="border-t border-slate-800">
                <td className="p-3 capitalize">{q.destination_network}</td>
                <td className="p-3 text-right">
                  {fmtUnits(q.destAmt, q.destination_currency === "usdc" ? 4 : 8)}{" "}
                  {q.destination_currency.toUpperCase()}
                </td>
                <td className="p-3 text-right">{usd(q.netFee)}</td>
                <td className="p-3 text-right">{usd(q.txFee)}</td>
                <td className="p-3 text-right font-medium">{usd(q.totalUsd)}</td>
                <td className="p-3 text-right">
                  {fmtUnits(q.unitsPerUsd, q.destination_currency === "usdc" ? 4 : 8)}
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={async () => {
                      const r = await fetch("/api/onramp/session", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          destination_currency: q.destination_currency,
                          destination_network: q.destination_network,
                        }),
                      });
                      const { redirect_url } = await r.json();
                      window.location.href = redirect_url;
                    }}
                    className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer"
                  >
                    Buy {q.destination_currency.toUpperCase()}
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td className="p-6 text-slate-500" colSpan={7}>
                  No quotes for this selection.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
