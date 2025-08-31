
"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

// Loads StripeOnramp global. You must add these to <head> in app/layout.tsx or this page
// <script src="https://js.stripe.com/basil/stripe.js"></script>
// <script src="https://crypto-js.stripe.com/crypto-onramp-outer.js"></script>

export default function OnrampEmbed() {
  const sp = useSearchParams();
  const cs = sp.get("cs");

  useEffect(() => {
    if (!cs) return;
    // @ts-ignore – StripeOnramp is injected by script tag
    const onramp = (window as any).StripeOnramp?.(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    );
    if (!onramp) return;
    const session = onramp.createSession({ clientSecret: cs });
    session.mount("#onramp-element");
  }, [cs]);

  return <div id="onramp-element" className="max-w-xl mx-auto my-8" />;
}

