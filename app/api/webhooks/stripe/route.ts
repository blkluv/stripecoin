import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";


export const runtime = "nodejs"; // ensure Node runtime for raw body


export async function POST(req: NextRequest) {
    const sig = req.headers.get("stripe-signature");
    if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });


    const raw = await req.text(); // get untouched body


    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            raw,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET as string
        );
    } catch (err: any) {
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }


    switch (event.type) {
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            // TODO: mark order paid in DB, grant access, etc.
            break;
        }
        case "payment_intent.succeeded": {
        // optional path if using direct PaymentIntents
        break;
    }
    default:
        break;
    }


    return NextResponse.json({ received: true }, { status: 200 });
}