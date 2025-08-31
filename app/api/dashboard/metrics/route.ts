import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import type StripeType from "stripe";

// Utility: floor to UTC date (YYYY-MM-DD)
function dayKey(ts: number) {
  const d = new Date(ts * 1000);
  return d.toISOString().slice(0, 10);
}

function rangeToSince(range: string | null): number | null {
  const now = Math.floor(Date.now() / 1000);
  switch (range) {
    case "7d":
      return now - 7 * 86400;
    case "30d":
      return now - 30 * 86400;
    case "90d":
      return now - 90 * 86400;
    case "all":
      return null; // no lower bound
    default:
      return now - 30 * 86400;
  }
}

function classifyMethod(charge: StripeType.Charge) {
  const pmd: any = (charge as any).payment_method_details;
  const type: string | undefined = pmd?.type;
  if (type === "crypto") return { kind: "crypto", network: pmd?.crypto?.network ?? "unknown" } as const;
  if (type === "card") return { kind: "card", network: pmd?.card?.network ?? "card" } as const;
  if (type) return { kind: type as any, network: type } as const;
  return { kind: "unknown" as const, network: "unknown" };
}

export async function GET(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return Response.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range"); // 7d | 30d | 90d | all
    const since = rangeToSince(range);

    // Page through charges with optional created>=since filter
    let starting_after: string | undefined;
    const all: StripeType.Charge[] = [];
    let pageCount = 0;

    while (true) {
      pageCount++;
      const page = await stripe.charges.list({
        limit: 100,
        ...(since ? { created: { gte: since } } : {}),
        starting_after,
        expand: ["data.balance_transaction"],
      });
      all.push(...page.data);
      if (!page.has_more || page.data.length === 0 || pageCount > 25) break; // hard stop ~2,500 charges
      starting_after = page.data[page.data.length - 1].id;
    }

    // Aggregate
    let total_count = 0;
    let total_volume = 0; // in smallest currency unit (assume USD cents)
    let crypto_count = 0;
    let crypto_volume = 0;
    let fiat_count = 0;
    let fiat_volume = 0;

    const currencySet = new Set<string>();
    const networks: Record<string, number> = {};

    const byDay: Record<string, { total: number; crypto: number; fiat: number; count: number }> = {};

    const lastPayments: { id: string; amount: number; currency: string; status: string; method: string; created: number }[] = [];

    for (const c of all) {
      if (c.status !== "succeeded") continue;

      const amt = (c.amount ?? 0) - (c.amount_refunded ?? 0);
      const curr = (c.currency || "usd").toLowerCase();
      currencySet.add(curr);
      total_count++;
      total_volume += amt;

      const cls = classifyMethod(c);
      const isCrypto = cls.kind === "crypto";
      if (isCrypto) {
        crypto_count++;
        crypto_volume += amt;
        networks[cls.network] = (networks[cls.network] || 0) + amt;
      } else {
        fiat_count++;
        fiat_volume += amt;
      }

      const key = dayKey(c.created || Math.floor(Date.now() / 1000));
      byDay[key] = byDay[key] || { total: 0, crypto: 0, fiat: 0, count: 0 };
      byDay[key].total += amt;
      byDay[key].count += 1;
      if (isCrypto) byDay[key].crypto += amt; else byDay[key].fiat += amt;

      if (lastPayments.length < 12) {
        lastPayments.push({
          id: c.id,
          amount: amt,
          currency: curr,
          status: c.status,
          method: cls.kind,
          created: c.created || 0,
        });
      }
    }

    // Build sorted daily series for the chosen range window
    const days: string[] = [];
    const end = new Date();
    const totalDays = range === "7d" ? 7 : range === "90d" ? 90 : 30;
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
      d.setUTCDate(d.getUTCDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }

    const series = days.map((d) => ({ date: d, ...(byDay[d] || { total: 0, crypto: 0, fiat: 0, count: 0 }) }));

    const avg_ticket = total_count ? Math.round(total_volume / total_count) : 0;

    // Top networks (crypto)
    const top_networks = Object.entries(networks)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, vol]) => ({ name, volume: vol }));

    return Response.json({
      range: range || "30d",
      totals: {
        total_count,
        total_volume,
        avg_ticket,
        crypto_count,
        crypto_volume,
        fiat_count,
        fiat_volume,
        currencies: Array.from(currencySet),
      },
      series, // [{ date, total, crypto, fiat, count }]
      top_networks,
      lastPayments,
      note:
        "Crypto detection is best-effort: uses payment_method_details.type==='crypto' when available; otherwise counts as fiat.",
    });
  } catch (e: any) {
    console.error(e);
    return Response.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

