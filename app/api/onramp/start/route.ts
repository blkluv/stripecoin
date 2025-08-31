import { NextRequest } from "next/server";
import { stripeREST } from "@/utils/stripe-rest";

/**
 * Body: {
 *   destination_currency: 'usdc' | 'eth' | ...,
 *   destination_network: 'ethereum' | 'solana' | 'polygon' | 'bitcoin' | 'stellar',
 *   destination_amount?: string, // mutually exclusive with source_amount
 *   source_amount?: string,
 *   wallet_address?: string, // optional: if provided, locks wallet
 * }
 */

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const {
    destination_currency,
    destination_network,
    destination_amount,
    source_amount,
    wallet_address,
  } = body || {};

  const form: Record<string, string | string[] | undefined> = {};
  if (destination_currency) form["destination_currency"] = destination_currency;
  if (destination_network) form["destination_network"] = destination_network;
  if (destination_amount) form["destination_amount"] = destination_amount;
  if (source_amount) form["source_amount"] = source_amount;

  if (wallet_address && destination_network) {
    form[`wallet_addresses[${destination_network}]`] = wallet_address;
    form["lock_wallet_address"] = "true";
  }

  form["source_currency"] = form["source_currency"] || "usd";

  const resp = (await stripeREST("/v1/crypto/onramp_sessions", {
    method: "POST",
    form,
  })) as Response;
  return resp;
}
