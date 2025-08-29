import Stripe from "stripe";


if (!process.env.STRIPE_SECRET_KEY) throw new Error("Missing STRIPE_SECRET_KEY");


// Avoid TS literal mismatch errors by sourcing the API version from env and
// casting through any. If not provided, fall back to the library's current
// version string (update as needed).
const DEFAULT_API_VERSION = "2025-08-27.basil"; // matches your installed stripe version's types


const cfg: Stripe.StripeConfig = {} as Stripe.StripeConfig;
(cfg as any).apiVersion = process.env.STRIPE_API_VERSION ?? DEFAULT_API_VERSION;


export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, cfg);


export function idempotencyKey(suffix?: string) {
    return `${crypto.randomUUID()}${suffix ? `:${suffix}` : ""}`;
}