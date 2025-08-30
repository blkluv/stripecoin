// ====================================================================
// app/api/checkout/create-intent/route.ts — secure server endpoint
// ====================================================================
import { NextRequest } from "next/server";
import Stripe from "stripe";

// Avoid hard‑coding apiVersion to prevent TS mismatch errors across SDK versions.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Very simple in‑memory catalog for demo. In prod, read from your DB.
const CATALOG: Record<string, { name: string; unit_amount: number }> = {
  sku_boost: { name: "API Throughput Boost", unit_amount: 100 }, // $12.00
  sku_support: { name: "Priority Support (mo)", unit_amount: 2000 },
  sku_widget: { name: "Pro Widget", unit_amount: 1000 },
};

export async function POST(req: NextRequest) {
  try {
    const { items, coupon } = (await req.json()) as {
      items: { id: string; name?: string; qty: number }[];
      coupon?: string;
    };

    // Recalculate the amount on the server to prevent tampering
    let amount = 0;
    const descriptionParts: string[] = [];
    for (const it of items ?? []) {
      const price = CATALOG[it.id];
      if (!price) continue;
      const qty = Math.max(1, Math.min(99, Number(it.qty) || 1));
      amount += price.unit_amount * qty;
      descriptionParts.push(`${price.name} x${qty}`);
    }

    // Demo coupon: SAVE10 => 10% off
    if (coupon && coupon.toUpperCase() === "SAVE10") amount = Math.max(50, Math.floor(amount * 0.9));

    if (!amount || amount < 50) amount = 500; // fallback $5.00

    const idempotency = req.headers.get("x-idempotency-key") || undefined;

    // Try to include Crypto alongside Card. If the account doesn't have Crypto enabled,
    // fall back to automatic PMs so the demo continues to work.
    let intent;
    try {
      intent = await stripe.paymentIntents.create(
        {
          amount,
          currency: "usd", // required for crypto PM
          payment_method_types: ["crypto", "card"],
          description: descriptionParts.join(", "),
          metadata: { items: JSON.stringify(items ?? []), coupon: coupon ?? "" },
        },
        idempotency ? { idempotencyKey: idempotency } : undefined
      );
    } catch (err: any) {
      console.warn("Falling back — crypto not enabled or unsupported:", err?.code || err?.message || err);
      intent = await stripe.paymentIntents.create(
        {
          amount,
          currency: "usd",
          automatic_payment_methods: { enabled: true },
          description: descriptionParts.join(", "),
          metadata: { items: JSON.stringify(items ?? []), coupon: coupon ?? "" },
        },
        idempotency ? { idempotencyKey: idempotency } : undefined
      );
      return Response.json({ client_secret: intent.client_secret, notice: "Crypto not enabled on this account — showing eligible methods only." });
    }

    return Response.json({ client_secret: intent.client_secret });
  } catch (e: any) {
    console.error("create-intent error", e);
    return Response.json({ error: e?.message || "Server error" }, { status: 400 });
  }
}
