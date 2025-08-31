// ====================================================================
// app/checkout/page.tsx — First-party checkout UI (Payment Element)
// ====================================================================
"use client";

import { useEffect, useMemo, useState } from "react";
import { Elements, useElements, useStripe, PaymentElement, AddressElement } from "@stripe/react-stripe-js";
import { loadStripe, StripeElementsOptions } from "@stripe/stripe-js";
import Link from "next/link";
import { formatUSD, lineTotal, subtotalCents, computeDiscount } from "@/lib/money";
import { DEMO_ITEMS, type CartItem } from "@/lib/cart";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>(DEMO_ITEMS);
  const [coupon, setCoupon] = useState<string>("");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => subtotalCents(cart), [cart]);
  const discount = useMemo(() => computeDiscount(coupon, subtotal), [coupon, subtotal]);
  const totalCents = Math.max(50, subtotal - discount); // Stripe min 50¢

  // create/update PaymentIntent for current cart on load / when totals change
  useEffect(() => {
    let ignore = false;
    async function createIntent() {
      setLoading(true);
      setError(null);
      try {
        const idempotency = crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
        const res = await fetch("/api/checkout/create-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-idempotency-key": idempotency,
          },
          body: JSON.stringify({ items: cart, coupon }),
          cache: "no-store",
        });
        const json = (await res.json()) as { client_secret?: string; error?: string; notice?: string };
        if (!res.ok) throw new Error(json.error || `Create intent failed: ${res.status}`);
        if (!ignore) {
          setClientSecret(json.client_secret || null);
          if (json.notice) setError(json.notice); // soft warn (e.g., crypto not enabled)
        }
      } catch (e: any) {
        console.warn(e);
        if (!ignore) setError(e?.message || "Failed to initialize payment");
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    createIntent();
    return () => {
      ignore = true;
    };
  }, [totalCents, coupon, cart]);

  const options: StripeElementsOptions | undefined = clientSecret
    ? {
        clientSecret,
        appearance: {
          theme: "night",
          labels: "floating",
          variables: {
            colorPrimary: "#ffffff",
            colorBackground: "#0a0a0a",
            colorText: "#ffffff",
            colorTextSecondary: "#a3a3a3",
            colorDanger: "#f87171",
            borderRadius: "12px",
          },
        },
      }
    : undefined;

  return (
    <main className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-neutral-950 text-white">
      <BgDecor />
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h1 className="text-balance bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-3xl font-semibold leading-tight text-transparent md:text-4xl">
              Checkout
            </h1>
            <p className="mt-2 max-w-2xl text-white/70">First-party checkout with Stripe Payment Element — includes a Crypto option when your account is enabled.</p>
          </div>
          <Link
            href="/"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            ← Back to home
          </Link>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          {/* Payment form */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Payment</h2>

            {/* Coupon */}
            <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
              <label className="block text-sm">
                <span className="mb-1 block text-white/90">Promo code</span>
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value.trim())}
                  placeholder="SAVE10"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm outline-none transition placeholder:text-white/30 focus:border-white/20"
                />
              </label>
              <div className="flex items-end">
                <span className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/70">
                  {discount > 0 ? `– ${formatUSD(discount)}` : "No discount"}
                </span>
              </div>
            </div>

            {/* Elements */}
            {clientSecret && options ? (
              <Elements stripe={stripePromise} options={options}>
                <ElementsForm cart={cart} coupon={coupon} totalCents={totalCents} />
              </Elements>
            ) : (
              <div className="mt-4 rounded-lg border border-white/10 bg-black/30 p-4 text-sm text-white/70">
                {loading ? "Initializing secure payment…" : error || "Unable to initialize payment."}
              </div>
            )}

            {/* Soft hint if crypto isn't enabled */}
            <div className="mt-4 text-xs text-white/50">
              If you do not see “Pay with Crypto” inside the Payment box, the Crypto payment method is not enabled on your account.
            </div>
          </div>

          {/* Order summary */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Order summary</h2>
            <div className="mt-4 space-y-3">
              {cart.map((it) => (
                <div key={it.id} className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-white/90">{it.name}</div>
                    <div className="text-xs text-white/60">Qty {it.qty}</div>
                  </div>
                  <div className="text-sm text-white/80">{formatUSD(lineTotal(it))}</div>
                </div>
              ))}
              <div className="my-3 h-px bg-white/10" />
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Subtotal</span>
                <span className="text-white/80">{formatUSD(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/60">Discount</span>
                <span className="text-white/80">–{formatUSD(discount)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatUSD(totalCents)}</span>
              </div>
              <div className="mt-3 text-xs text-white/50">Tax/shipping omitted for demo.</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ElementsForm({ cart, coupon, totalCents }: { cart: CartItem[]; coupon: string; totalCents: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setMessage(null);

    // Optional: update intent before confirm (e.g., send latest cart/coupon)
    try {
      const res = await fetch("/api/checkout/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: cart, coupon }),
      });
      if (!res.ok) throw new Error("Failed to refresh intent");
    } catch (e) {
      // Non-blocking in demo
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
      redirect: "if_required",
    });

    if (error) setMessage(error.message || "Payment failed. Check details and try again.");
    else setMessage("Payment processing… if no redirect occurred, your payment may be complete.");

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 text-sm font-medium text-white/90">Contact & billing</div>
        <AddressElement options={{ mode: "billing" }} />
      </div>
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <div className="mb-3 text-sm font-medium text-white/90">Payment details (includes Crypto)</div>
        <PaymentElement />
      </div>
      {message && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">{message}</div>}
      <button
        disabled={!stripe || !elements || submitting}
        className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black shadow-xl transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Processing…" : `Pay ${formatUSD(totalCents)}`}
      </button>
    </form>
  );
}

function BgDecor() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_60%)]"
        style={{
          background:
            "radial-gradient(1200px_600px_at_80%_-10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(900px_500px_at_-10%_20%, rgba(34,197,94,0.22), transparent 60%), radial-gradient(700px_400px_at_50%_120%, rgba(244,114,182,0.18), transparent 60%)",
        }}
      />
      <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.08]" aria-hidden>
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </>
  );
}
