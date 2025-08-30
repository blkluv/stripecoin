// ====================================================================
// app/dashboard/page.tsx — live dashboard (no extra deps)
// ====================================================================
"use client";

import { useEffect, useMemo, useState } from "react";

type SeriesPoint = { date: string; total: number; crypto: number; fiat: number; count: number };

type Metrics = {
  range: string;
  totals: {
    total_count: number;
    total_volume: number;
    avg_ticket: number;
    crypto_count: number;
    crypto_volume: number;
    fiat_count: number;
    fiat_volume: number;
    currencies: string[];
  };
  series: SeriesPoint[];
  top_networks: { name: string; volume: number }[];
  lastPayments: { id: string; amount: number; currency: string; status: string; method: string; created: number }[];
  note?: string;
};

function usd(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export default function DashboardPage() {
  const [range, setRange] = useState<"7d" | "30d" | "90d">("30d");
  const [data, setData] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/dashboard/metrics?range=${range}`, { cache: "no-store" });
      const json = (await res.json()) as any;
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setData(json);
    } catch (e: any) {
      setError(e?.message || "Failed to load metrics");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const dailyMax = useMemo(() => (data ? Math.max(1, ...data.series.map((p) => p.total)) : 1), [data]);

  return (
    <main className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-neutral-950 text-white">
      <BgDecor />

      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-balance bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-3xl font-semibold leading-tight text-transparent md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-white/70">Live Stripe metrics: totals, crypto vs. fiat, daily trend, and recent payments.</p>
          </div>
          <div className="flex items-center gap-2">
            {(["7d", "30d", "90d"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`rounded-xl px-3 py-1.5 text-sm transition ${
                  range === r ? "bg-white text-black font-semibold" : "border border-white/15 bg-white/5 text-white/90 hover:bg-white/10"
                }`}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          <KPI title="Total volume" value={data ? usd(data.totals.total_volume) : "—"} loading={loading} />
          <KPI title="Payments" value={data ? data.totals.total_count.toLocaleString() : "—"} loading={loading} />
          <KPI title="Avg ticket" value={data ? usd(data.totals.avg_ticket) : "—"} loading={loading} />
          <KPI
            title="Crypto share"
            value={
              data
                ? `${((data.totals.crypto_volume / Math.max(1, data.totals.total_volume)) * 100).toFixed(1)}%`
                : "—"
            }
            subtitle={data ? `${usd(data.totals.crypto_volume)} crypto` : undefined}
            loading={loading}
          />
        </div>

        {/* Trend + breakdown */}
        <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Daily volume</h2>
              <span className="text-xs text-white/60">{data ? `${data.series.length} days` : "—"}</span>
            </div>
            <div className="mt-4">
              {data ? <BarChart points={data.series} max={dailyMax} /> : <ChartSkeleton />}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Breakdown</h2>
            {data ? (
              <div className="mt-3 space-y-3 text-sm">
                <BreakdownRow label="Crypto" value={data.totals.crypto_volume} total={data.totals.total_volume} />
                <BreakdownRow label="Fiat" value={data.totals.fiat_volume} total={data.totals.total_volume} />
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-white/80">Top crypto networks</h3>
                  {data.top_networks.length ? (
                    <div className="mt-2 space-y-2">
                      {data.top_networks.map((n) => (
                        <div key={n.name} className="flex items-center justify-between text-sm">
                          <span className="text-white/80">{n.name}</span>
                          <span className="text-white/70">{usd(n.volume)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-white/60">No crypto network breakdown available.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-white/60">Loading…</div>
            )}
          </div>
        </div>

        {/* Recent payments table */}
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Recent payments</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-white/60">
                <tr>
                  <th className="py-2">ID</th>
                  <th className="py-2">Date</th>
                  <th className="py-2">Method</th>
                  <th className="py-2">Status</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {loading || !data ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-white/60">
                      {error || "Loading…"}
                    </td>
                  </tr>
                ) : (
                  data.lastPayments.map((p) => (
                    <tr key={p.id} className="border-t border-white/10">
                      <td className="py-2 font-mono text-xs text-white/80">{p.id}</td>
                      <td className="py-2 text-white/80">{new Date(p.created * 1000).toLocaleString()}</td>
                      <td className="py-2">
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-xs uppercase">
                          {p.method}
                        </span>
                      </td>
                      <td className="py-2 text-white/70">{p.status}</td>
                      <td className="py-2 text-right text-white/90">{usd(p.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {data?.note && <div className="mt-3 text-xs text-white/50">{data.note}</div>}
        </div>
      </section>
    </main>
  );
}

function KPI({ title, value, subtitle, loading }: { title: string; value: string | number; subtitle?: string; loading?: boolean }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <div className="text-xs text-white/60">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{loading ? "…" : value}</div>
      {subtitle && <div className="mt-1 text-xs text-white/60">{subtitle}</div>}
    </div>
  );
}

function BreakdownRow({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = Math.round((value / Math.max(1, total)) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-white/80">{label}</span>
        <span className="text-white/70">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div className="h-2 rounded-full bg-white" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1 text-xs text-white/60">{usd(value)}</div>
    </div>
  );
}

function BarChart({ points, max }: { points: SeriesPoint[]; max: number }) {
  return (
    <div className="flex h-40 items-end gap-1">
      {points.map((p) => (
        <div key={p.date} className="flex w-full basis-full flex-col items-center gap-1">
          <div className="flex w-full items-end gap-0.5">
            <div className="h-full w-full rounded-t bg-white/40" style={{ height: `${(p.total / max) * 100}%` }} />
            <div className="h-full w-full rounded-t bg-white" style={{ height: `${(p.crypto / max) * 100}%` }} />
          </div>
          <div className="text-[10px] text-white/50">{p.date.slice(5)}</div>
        </div>
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <div className="h-40 animate-pulse rounded-lg bg-white/10" />;
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
