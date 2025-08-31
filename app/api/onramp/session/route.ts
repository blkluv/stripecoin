import { NextRequest, NextResponse } from "next/server";
import { idempotencyKey } from "@/lib/stripe";


export async function POST(req: NextRequest) {
    const { destination_currency = "usdc", destination_network = "solana", wallet_address } = await req.json();


    const allowedCurrencies = new Set(["usdc"]);
    const allowedNetworks = new Set(["solana", "ethereum", "polygon", "bitcoin", "stellar", "avalanche", "base"]);
    if (!allowedCurrencies.has(destination_currency) || !allowedNetworks.has(destination_network))
        return NextResponse.json({ error: "Unsupported destination" }, { status: 400 });


    const form = new URLSearchParams();
    form.set("destination_currency", destination_currency);
    form.set("destination_network", destination_network);
    if (wallet_address) {
        // Attach a per-network wallet (recommended param shape per docs)
        form.set(`wallet_addresses[${destination_network}]`, wallet_address);
        form.set("lock_wallet_address", "true");
    }


    const res = await fetch("https://api.stripe.com/v1/crypto/onramp_sessions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Idempotency-Key": idempotencyKey("onramp"),
            "Stripe-Version": process.env.STRIPE_API_VERSION ?? "2025-08-27.basil",
        },
        body: form.toString(),
    });


    const session = await res.json();
    if (!res.ok) return NextResponse.json({ error: session?.error?.message || "Onramp session failed" }, { status: 400 });
    return NextResponse.json({ id: session.id, redirect_url: session.redirect_url }, { status: 200 });
}