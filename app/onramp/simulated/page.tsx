// ====================================================================
// 4) app/onramp/simulated/page.tsx — simple in-app simulator
//    - Lets you demo the flow end-to-end even without account on-ramp access
// ====================================================================
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function SimulatedOnrampPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const currency = (sp.get("currency") || "usdc").toUpperCase();
  const network = sp.get("network") || "ethereum";
  const amount = sp.get("amount") || "0";

  return (
    <main className="relative min-h-[calc(100vh-8rem)] bg-neutral-950 text-white">
      <div className="mx-auto max-w-md px-6 py-14 text-center">
        <h1 className="text-2xl font-semibold">Simulated On-Ramp</h1>
        <p className="mt-2 text-white/70">
          This sim pretends to complete a hosted on-ramp for {amount} {currency} on {network}.
        </p>
        <div className="mt-6">
          <button
            onClick={async () => {
              setBusy(true);
              await new Promise((r) => setTimeout(r, 1200));
              router.push("/dashboard");
            }}
            disabled={busy}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-xl transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {busy ? "Completing…" : "Complete on-ramp"}
          </button>
        </div>
        <div className="mt-3">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}
