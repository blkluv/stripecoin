"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// ---- Types ----

type Fees = {
  network_fee_monetary?: string;
  transaction_fee_monetary?: string;
} | null;

export type Quote = {
  id: string;
  destination_network: string;
  destination_currency: string;
  destination_amount: string;
  source_total_amount: string;
  fees: Fees;
};

// ---- Utils ----
function usd(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD" });
}
function num(s?: string | number | null) {
  if (typeof s === "number") return Number.isFinite(s) ? s : 0;
  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
}
function fmtUnits(n: number, max = 8) {
  return n.toLocaleString(undefined, { maximumFractionDigits: max });
}
function labelize(s: string) {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ---- Mocking & API ----
const API_PATH = "/api/onramp/quotes"; // If not implemented, we fall back to mocks

const NETWORKS = [
  { value: "ethereum", label: "Ethereum" },
  { value: "solana", label: "Solana" },
  { value: "xrpl", label: "XRPL (concept)" },
];

const CURRENCIES = [
  { value: "usdc", label: "USDC" },
  { value: "eth", label: "ETH" },
  { value: "rlusd", label: "RLUSD" },
];

function makeMockQuotes({ amount, network, currency }: { amount: number; network: string; currency: string }): Quote[] {
  const base = Math.max(10, Math.min(25000, amount || 200));
  const fee = (p: number) => Math.max(0.75, base * p);
  const mixes = [
    { id: "q_1", netMult: 0.985, nf: 0.007, tf: 0.003 },
    { id: "q_2", netMult: 0.982, nf: 0.006, tf: 0.004 },
    { id: "q_3", netMult: 0.987, nf: 0.008, tf: 0.002 },
    { id: "q_4", netMult: 0.980, nf: 0.009, tf: 0.004 },
  ];
  return mixes.map((m) => ({
    id: `${m.id}_${network}_${currency}_${base}`,
    destination_network: network,
    destination_currency: currency,
    destination_amount: (base * m.netMult).toFixed(currency === "eth" ? 6 : 2),
    source_total_amount: (base + fee(m.nf) + fee(m.tf)).toFixed(2),
    fees: {
      network_fee_monetary: fee(m.nf).toFixed(2),
      transaction_fee_monetary: fee(m.tf).toFixed(2),
    },
  }));
}

// ---- Page ----
export default function OnrampPage() {
  const router = useRouter();

  // selectors
  const [sourceAmount, setSourceAmount] = useState<string>("200");
  const [sourceCurrency] = useState<string>("usd");
  const [destNetwork, setDestNetwork] = useState<string>("ethereum");
  const [destCurrency, setDestCurrency] = useState<string>("usdc");

  // data
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selected, setSelected] = useState<Quote | null>(null);

  const effective = useMemo(() => {
    if (!selected) return 0;
    const net = num(selected.destination_amount);
    const gross = num(selected.source_total_amount);
    return gross > 0 ? (net / gross) * 100 : 0;
  }, [selected]);

  async function fetchQuotes() {
    setLoading(true);
    setError(null);
    setSelected(null);
    try {
      const params = new URLSearchParams({
        source_amount: String(num(sourceAmount) || 0),
        source_currency: sourceCurrency,
        destination_network: destNetwork,
        destination_currency: destCurrency,
      });
      const res = await fetch(`${API_PATH}?${params.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Quote API ${res.status}`);
      const data = (await res.json()) as { quotes?: Quote[]; data?: Quote[] } | Quote[];
      const list = Array.isArray(data)
        ? data
        : Array.isArray((data as any).quotes)
        ? (data as any).quotes
        : Array.isArray((data as any).data)
        ? (data as any).data
        : [];
      if (!list.length) throw new Error("No quotes returned");
      setQuotes(list);
    } catch (err: any) {
      console.warn("Quote fetch failed — using mock quotes:", err?.message || err);
      const mocks = makeMockQuotes({ amount: num(sourceAmount), network: destNetwork, currency: destCurrency });
      setQuotes(mocks);
      setError("Using mock quotes (couldn't reach your quote API). Wire /api/onramp/quotes to Stripe and this dismisses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchQuotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function goToConfirm(q: Quote) {
    const p = new URLSearchParams({
      id: q.id,
      network: q.destination_network,
      currency: q.destination_currency,
      dest_amount: q.destination_amount,
      source_total_amount: q.source_total_amount,
      nf: q.fees?.network_fee_monetary || "",
      tf: q.fees?.transaction_fee_monetary || "",
    });
    router.push(`/onramp/confirm?${p.toString()}`);
  }

  return (
    <main className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-neutral-950 text-white">
      <BgDecor />

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:py-14">
        {/* Header */}
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div className="min-w-0">
            <h1 className="text-balance bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-3xl font-semibold leading-tight text-transparent md:text-4xl">
              Stablecoin On-Ramp
            </h1>
            <p className="mt-2 max-w-2xl text-white/70">
              Compare quotes across networks/currencies, see fees clearly, and kick off your on-ramp in a first-party UI.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">Demo</span>
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">No PII</span>
          </div>
        </div>

        {/* Controls + Summary */}
        <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          {/* Controls Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Request a quote</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Source amount (USD)">
                <AmountInput value={sourceAmount} onChange={setSourceAmount} min={10} max={25000} />
              </Field>
              <Field label="Destination currency">
                <Select value={destCurrency} onChange={setDestCurrency} options={CURRENCIES} />
              </Field>
              <Field label="Destination network">
                <Select value={destNetwork} onChange={setDestNetwork} options={NETWORKS} />
              </Field>
              <Field label="Source currency" hint="Fixed to USD in this demo">
                <ReadOnlyPill>USD</ReadOnlyPill>
              </Field>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={fetchQuotes}
                disabled={loading}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-xl transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Fetching quotes…" : "Get quotes"}
              </button>
              <Link
                href="/"
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
              >
                Back to home
              </Link>
            </div>
            {error && (
              <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                {error}
              </div>
            )}
          </div>

          {/* Summary Card */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Summary</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Stat label="You pay" value={usd(num(sourceAmount))} />
              <Stat label="Currency" value="USD" />
              <Stat label="Network" value={labelize(destNetwork)} />
              <Stat label="Asset" value={destCurrency.toUpperCase()} />
            </div>
            <div className="mt-6 min-w-0">
              <h3 className="text-sm font-medium text-white/80">Selected quote</h3>
              {selected ? (
                <div className="mt-2 min-w-0 rounded-xl border border-white/10 bg-black/30 p-4">
                  <div className="flex min-w-0 flex-wrap items-center justify-between gap-2 md:gap-4 text-sm">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <Tag>{labelize(selected.destination_network)}</Tag>
                      <Tag>{selected.destination_currency.toUpperCase()}</Tag>
                      <span className="max-w-full truncate text-white/70 md:max-w-none md:truncate-0 break-all">
                        ID: {selected.id}
                      </span>
                    </div>
                    <div className="min-w-0 text-right">
                      <div className="text-white/90">
                        {fmtUnits(num(selected.destination_amount))} {selected.destination_currency.toUpperCase()}
                      </div>
                      <div className="text-xs text-white/60">Cost: {usd(num(selected.source_total_amount))}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Progress value={effective} />
                    <div className="mt-1 text-right text-xs text-white/60">Effective: {effective.toFixed(2)}%</div>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-white/70">
                    <span className="min-w-0">
                      Network fee: {usd(num(selected.fees?.network_fee_monetary))} • Tx fee: {usd(num(selected.fees?.transaction_fee_monetary))}
                    </span>
                    <button
                      onClick={() => goToConfirm(selected)}
                      className="rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-black transition hover:bg-white/90"
                    >
                      Start on-ramp
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2 rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">No quote selected yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* Quotes List */}
        <div className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Available quotes</h2>
            <span className="text-sm text-white/60">{loading ? "…" : `${quotes.length} result${quotes.length === 1 ? "" : "s"}`}</span>
          </div>
          {loading ? (
            <div className="grid gap-3 md:grid-cols-2">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {quotes.map((q) => (
                <QuoteCard key={q.id} q={q} selected={selected?.id === q.id} onSelect={() => setSelected(q)} onContinue={() => goToConfirm(q)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sticky selection bar — MOBILE SAFE */}
      {selected && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/70 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 md:flex-row md:gap-3">
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
              <span className="shrink-0 text-xs text-white/70">Selected:</span>
              <Tag className="shrink-0">{labelize(selected.destination_network)}</Tag>
              <Tag className="shrink-0">{selected.destination_currency.toUpperCase()}</Tag>
              <span className="min-w-0 truncate text-xs text-white/80">
                {fmtUnits(num(selected.destination_amount))} {selected.destination_currency.toUpperCase()} • Cost {usd(num(selected.source_total_amount))}
              </span>
            </div>
            <div className="flex w-full items-center justify-end gap-2 md:w-auto">
              <button
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                onClick={() => setSelected(null)}
              >
                Clear
              </button>
              <button
                className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
                onClick={() => goToConfirm(selected)}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ---- Components ----
function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="mb-1 flex items-center gap-2">
        <span className="font-medium text-white/90">{label}</span>
        {hint && <span className="text-xs text-white/50">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function AmountInput({ value, onChange, min = 0, max = 100000 }: { value: string; onChange: (s: string) => void; min?: number; max?: number }) {
  return (
    <input
      inputMode="decimal"
      value={value}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9.]/g, "");
        const parts = raw.split(".");
        const safe = parts.length > 2 ? parts[0] + "." + parts.slice(1).join("") : raw;
        const n = num(safe);
        if (n < min) return onChange(String(min));
        if (n > max) return onChange(String(max));
        onChange(safe);
      }}
      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none transition placeholder:text-white/30 focus:border-white/20"
      placeholder="200"
    />
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 outline-none transition focus:border-white/20"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ReadOnlyPill({ children }: { children: React.ReactNode }) {
  return <div className="inline-flex h-[38px] w-full items-center rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-white/70">{children}</div>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-3">
      <div className="text-xs text-white/60">{label}</div>
      <div className="mt-0.5 min-w-0 truncate text-sm font-medium text-white/90">{value}</div>
    </div>
  );
}

function Tag({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs ${className}`}>{children}</span>;
}

function Progress({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-1.5 w-full rounded-full bg-white/10">
      <div className="h-1.5 rounded-full bg-white" style={{ width: `${v}%` }} />
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded bg-white/10" />
        <div className="h-4 w-16 rounded bg-white/10" />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3">
        <div className="h-6 rounded bg-white/10" />
        <div className="h-6 rounded bg-white/10" />
        <div className="h-6 rounded bg-white/10" />
      </div>
      <div className="mt-3 h-8 w-28 rounded bg-white/10" />
    </div>
  );
}

function QuoteCard({ q, selected, onSelect, onContinue }: { q: Quote; selected: boolean; onSelect: () => void; onContinue: () => void }) {
  const net = num(q.destination_amount);
  const gross = num(q.source_total_amount);
  const eff = gross > 0 ? (net / gross) * 100 : 0;
  const networkFee = num(q.fees?.network_fee_monetary);
  const txFee = num(q.fees?.transaction_fee_monetary);

  return (
    <div
      className={`relative overflow-hidden rounded-xl border p-4 transition ${selected ? "border-white/40 bg-white/10 shadow-xl" : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"}`}
      onClick={onSelect}
      role="button"
    >
      <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
        <div className="flex min-w-0 items-center gap-2">
          <Tag className="shrink-0">{labelize(q.destination_network)}</Tag>
          <Tag className="shrink-0">{q.destination_currency.toUpperCase()}</Tag>
          <span className="hidden min-w-0 truncate text-xs text-white/60 sm:block">{q.id}</span>
        </div>
        <span className="shrink-0 text-white/60">Eff: {eff.toFixed(2)}%</span>
      </div>
      <div className="mt-2 grid grid-cols-3 items-end gap-3">
        <div>
          <div className="text-xs text-white/60">You receive</div>
          <div className="text-base font-semibold text-white/90">
            {fmtUnits(net)} {q.destination_currency.toUpperCase()}
          </div>
        </div>
        <div>
          <div className="text-xs text-white/60">You pay</div>
          <div className="text-base font-medium text-white/90">{usd(gross)}</div>
        </div>
        <div className="text-right">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onContinue();
            }}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            {selected ? "Selected" : "Choose"}
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-white/70">
        <span>Network fee {usd(networkFee)}</span>
        <span>• Tx fee {usd(txFee)}</span>
        <span className="break-all">• {q.id}</span>
      </div>
    </div>
  );
}

function BgDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_60%)]"
        style={{
          background:
            "radial-gradient(1200px_600px_at_80%_-10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(900px_500px_at_-10%_20%, rgba(34,197,94,0.22), transparent 60%), radial-gradient(700px_400px_at_50%_120%, rgba(244,114,182,0.18), transparent 60%)",
        }}
      />
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.08]" aria-hidden>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </>
  );
}