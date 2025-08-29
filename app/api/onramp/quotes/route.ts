// app/api/quotes/route.ts
import { NextRequest, NextResponse } from "next/server";

// Optional: force server execution in Next.js
export const dynamic = "force-dynamic";

function fmtAmount(n: number) {
  // Stripe accepts strings; keep 2 decimals for fiat amounts.
  return n.toFixed(2);
}

//function buildVersionHeader() {
  //const base = process.env.STRIPE_API_VERSION?.trim(); // e.g. "2025-08-27.basil"
  //const beta = process.env.STRIPE_CRYPTO_ONRAMP_BETA?.trim(); // e.g. "v2"
  //const parts = [base, beta ? `crypto_onramp_beta=${beta}` : null].filter(Boolean);
  //return parts.length ? parts.join(";") : undefined;
//}

function buildVersionHeader() {
  // Either omit entirely (preferred while troubleshooting)
  // or set a plain date-only version if you want to pin:
  // e.g. STRIPE_API_VERSION=2025-08-27.basil
  const base = process.env.STRIPE_API_VERSION?.trim();
  return base || undefined; // no beta flags here
}

async function callStripe(path: string, search: URLSearchParams) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY!}`,
  };
  const ver = buildVersionHeader();
  if (ver) headers["Stripe-Version"] = ver;

  const url = new URL(`https://api.stripe.com${path}`);
  // copy params
  search.forEach((v, k) => url.searchParams.append(k, v));

  const res = await fetch(url.toString(), { method: "GET", headers });
  //console.log(res.json())
  const json = await res.json().catch(() => ({}));
  console.log(json)
  return { res, json };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const amount = Number(searchParams.get("amount") ?? 200);
  const source_amount = fmtAmount(Number.isFinite(amount) ? amount : 200);

  // Build query from input (add your own validation as needed)
  const q = new URLSearchParams();
  q.set("source_amount", source_amount);
  q.set("source_currency", (searchParams.get("source_currency") ?? "usd").toLowerCase());

  // Optional filters (comma-separated in query; we fan out to [] params)
  const destCurrencies = (searchParams.get("destination_currencies") ?? "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
  const destNetworks = (searchParams.get("destination_networks") ?? "")
    .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);

  for (const c of destCurrencies) q.append("destination_currencies[]", c);
  for (const n of destNetworks) q.append("destination_networks[]", n);

  // Try latest path first, then fall back to the older nested path
  const primaryPath = "/v1/crypto/onramp_quotes";
  const fallbackPath = "/v1/crypto/onramp/quotes";

  let { res, json } = await callStripe(primaryPath, q);

  if (res.status === 404 && json?.error?.message?.includes("Unrecognized request URL")) {
    ({ res, json } = await callStripe(fallbackPath, q));
  }

  if (!res.ok) {
    return NextResponse.json(
      { error: json?.error?.message || "Failed to fetch quotes" },
      { status: res.status || 400 },
    );
  }

  // Flatten destination_network_quotes map → array
  const flattened: Array<{
    id: string;
    destination_network: string;
    destination_currency: string;
    destination_amount: string;
    source_total_amount: string;
    fees: Record<string, unknown> | null;
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
