import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";


export async function POST(req: NextRequest) {
    const { account } = await req.json();
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_BASE_URL!;


    const link = await stripe.accountLinks.create({
        account,
        refresh_url: `${origin}/connect/onboard`,
        return_url: `${origin}/connect/onboard?complete=1`,
        type: "account_onboarding",
    });


    return NextResponse.json({ url: link.url }, { status: 200 });
}