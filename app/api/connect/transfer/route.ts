import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { stripe, idempotencyKey } from "@/lib/stripe";


const Body = z.object({ account: z.string().startsWith("acct_"), amount: z.number().int().min(100).max(1_000_000) });


export async function POST(req: NextRequest) {
    const json = await req.json().catch(() => null);
    const parsed = Body.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });


    const { account, amount } = parsed.data;


    // (Optional) verify account capability state here
    // const acct = await stripe.accounts.retrieve(account);
    // if (acct.capabilities?.transfers !== 'active') return NextResponse.json({ error: 'Transfers not active' }, { status: 400 });


    const transfer = await stripe.transfers.create({
        amount, // in cents
        currency: "usd",
        destination: account,
        description: "Creator payout (auto-convert to USDC if wallet linked)",
    }, { idempotencyKey: idempotencyKey("transfer") });


    return NextResponse.json({ id: transfer.id, amount: transfer.amount, currency: transfer.currency, destination: transfer.destination }, { status: 200 });
}