
import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { accountId } = await req.json();
  if (!accountId) return Response.json({ error: "Missing accountId" }, { status: 400 });
  const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  try {
    const link = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${origin}/connect/refresh?account=${accountId}`,
      return_url: `${origin}/connect/return?account=${accountId}`,
    });
    return Response.json({ url: link.url });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
