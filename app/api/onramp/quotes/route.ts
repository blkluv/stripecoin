// /app/api/quotes/route.ts
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function fmtAmount(n: number) { return n.toFixed(2); }

function buildVersionHeader() {
  const base = process.env.STRIPE_API_VERSION?.trim();
  return base || undefined;
}

async function callStripe(path: string, search: URLSearchParams) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY!}`,
  };
  const ver = buildVersionHeader();
  if (ver) headers["Stripe-Version"] = ver;

  const url = new URL(`https://api.stripe.com${path}`);
  search.forEach((v, k) => url.searchParams.append(k, v));

  const res = await fetch(url.toString(), { method: "GET", headers });
  const json = await res.json().catch(() => ({}));
  return { res, json };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const amount = Number(searchParams.get("amount") ?? 200);
  const source_amount = fmtAmount(Number.isFinite(amount) ? amount : 200);

  const q = new URLSearchParams();
  q.set("source_amount", source_amount);
  q.set("source_currency", (searchParams.get("source_currency") ?? "usd").toLowerCase());

  const destCurrencies = (searchParams.get("destination_currencies") ?? "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const destNetworks = (searchParams.get("destination_networks") ?? "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

  for (const c of destCurrencies) q.append("destination_currencies[]", c);
  for (const n of destNetworks) q.append("destination_networks[]", n);

  // Correct Stripe endpoint per docs:
  // GET /v1/crypto/onramp/quotes
  const { res, json } = await callStripe("/v1/crypto/onramp/quotes", q);
  if (!res.ok) {
    return NextResponse.json(
      { error: (json as any)?.error?.message || "Failed to fetch quotes" },
      { status: res.status || 400 },
    );
  }

  type Fees = {
    network_fee_monetary?: string;
    transaction_fee_monetary?: string;
  };

  // Flatten destination_network_quotes map → array (UI-ready)
  const flattened: Array<{
    id: string;
    destination_network: string;
    destination_currency: string;
    destination_amount: string;
    source_total_amount: string;
    fees: Fees | null;
  }> = [];

  const map = (json as any)?.destination_network_quotes ?? {};
  for (const [network, arr] of Object.entries(map)) {
    for (const q of (arr as any[]) || []) {
      flattened.push({
        id: q.id,
        destination_network: network,
        destination_currency: q.destination_currency,
        destination_amount: q.destination_amount,
        source_total_amount: q.source_total_amount,
        fees: q.fees ?? null,
      });
    }
  }

  return NextResponse.json({ data: flattened }, { status: 200 });
}
