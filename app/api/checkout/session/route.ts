import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe, idempotencyKey } from "@/lib/stripe";


const Body = z.object({ name: z.string().min(1), amount: z.number().int().min(100).max(50_000), currency: z.literal("usd") });


export async function POST(req: NextRequest) {
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL!;
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";


    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });


    const { name, amount } = parsed.data;


     // hard cap + allowlist check - never trust client amounts
    const ALLOWED = new Set([2000, 5000, 10000]);
    if (!ALLOWED.has(amount)) return NextResponse.json({ error: "Unsupported amount" }, { status: 400 });


    const session = await stripe.checkout.sessions.create({
        mode: "payment",
        // critical: crypto must be explicitly included and currency must be usd
        payment_method_types: ["crypto"],
        line_items: [{
        price_data: { currency: "usd", unit_amount: amount, product_data: { name } }, quantity: 1,
    }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/checkout`,
    // optional: collect billing for better fraud outcomes
    customer_creation: "if_required",
    client_reference_id: ip,
}, { idempotencyKey: idempotencyKey("checkout") });


    return NextResponse.json({ id: session.id, url: session.url }, { status: 200 });
}