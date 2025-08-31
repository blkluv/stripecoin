// ====================================================================
// 3) app/api/onramp/start/route.ts — server action to initiate hosted on‑ramp
//    - If you have an external hosted on‑ramp URL, set NEXT_PUBLIC_ONRAMP_DEMO_URL
//    - Otherwise returns a simulated next step inside the app
//    - You can wire your real Stripe On‑ramp create call here when enabled
// ====================================================================
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, network, currency, dest_amount, source_total_amount } = body || {};

    // If you have a hosted on‑ramp URL (e.g., from Stripe), redirect there
    const demoUrl = process.env.NEXT_PUBLIC_ONRAMP_DEMO_URL;
    if (demoUrl) {
      // Example: append useful context
      const u = new URL(demoUrl);
      u.searchParams.set("asset", String(currency || ""));
      u.searchParams.set("network", String(network || ""));
      u.searchParams.set("amount", String(dest_amount || ""));
      return Response.json({ url: u.toString() });
    }

    // TODO: Wire real Stripe On‑ramp session creation when enabled for your account.
    // Pseudo-code (avoid TS error `property 'crypto' does not exist on type 'Stripe'`):
    // const session = await (stripe as any).crypto.onramp.sessions.create({
    //   destination_currency: currency,
    //   destination_network: network,
    //   destination_amount: dest_amount,
    //   // ...your customer context...
    // });
    // return Response.json({ url: session?.url });

    // Fallback to simulated flow inside the app so the button actually does something
    const params = new URLSearchParams({ currency, network, amount: dest_amount });
    return Response.json({ next: `/onramp/simulated?${params.toString()}` });
  } catch (e: any) {
    return Response.json({ error: e?.message || "server error" }, { status: 400 });
  }
}