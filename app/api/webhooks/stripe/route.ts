import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";

export const runtime = "nodejs";

type OnrampEventType = Stripe.Event.Type | "crypto.onramp_session_updated";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const raw = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  const type = event.type as OnrampEventType;

  switch (type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // mark order paid, etc.
      break;
    }
    case "payment_intent.succeeded": {
      // direct PI path
      break;
    }
    case "crypto.onramp_session_updated": {
      // Shape is CryptoOnrampSession (not in Stripe types yet).
      const onramp = event.data.object as any;
      // e.g. onramp.status { initialized, rejected, requires_payment, fulfillment_processing, fulfillment_complete }
      // handle status transitions, persist, etc.
      break;
    }
    default:
      // ignore other events
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
