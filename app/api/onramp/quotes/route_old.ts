import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const source_amount = String(Number(searchParams.get("amount") ?? 200));


    const url = new URL("https://api.stripe.com/v1/crypto/onramp/quotes");
    //url.searchParams.set("source_amount", source_amount);
    //url.searchParams.set("source_currency", "usd");
    //url.searchParams.append("destination_currencies[]", "usdc");
    //url.searchParams.append("destination_networks[]", "ethereum");
    //url.searchParams.append("destination_networks[]", "solana");


    //const res = await fetch(url.toString(), {
    const res = await fetch("https://api.stripe.com/v1/crypto/onramp_quotes", {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
            "Stripe-Version": process.env.STRIPE_API_VERSION ?? "2025-08-27.basil",
        }
    });
    const json = await res.json();
    console.log(json)
    if (!res.ok) return NextResponse.json({ error: json?.error?.message || "Failed to fetch quotes" }, { status: 400 });


    // json.destination_network_quotes is a map => flatten to an array for the UI
    const flattened: any[] = [];
    const map = json.destination_network_quotes || {};
    for (const [network, arr] of Object.entries(map)) {
        for (const q of arr as any[]) {
            flattened.push({
                id: (q as any).id,
                destination_network: network,
                destination_currency: (q as any).destination_currency,
                destination_amount: (q as any).destination_amount,
                source_total_amount: (q as any).source_total_amount,
                fees: (q as any).fees,
            });
        }
    }


    return NextResponse.json({ data: flattened }, { status: 200 });
}