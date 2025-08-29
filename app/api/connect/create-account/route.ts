import { NextRequest, NextResponse } from "next/server";
import { stripe, idempotencyKey } from "@/lib/stripe";


export async function POST(req: NextRequest) {
    const account = await stripe.accounts.create({
        type: "express",
        country: "US",
        capabilities: {
            transfers: { requested: true },
            // crypto_payments: { requested: true }, // if/when enabled for the account
        },
        business_type: "individual",
    }, { idempotencyKey: idempotencyKey("acct") });


    return NextResponse.json({ id: account.id }, { status: 200 });
}