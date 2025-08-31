import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email: string | undefined = body.email;
  try {
    const account = await stripe.accounts.create({
      type: "express",
      email,
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      business_profile: { product_description: "Stablecoin Commerce demo" },
    });
    return Response.json({ accountId: account.id });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
