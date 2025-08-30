// ====================================================================
// app/checkout/success/page.tsx — post‑redirect thank‑you page
// ====================================================================
export const metadata = { title: "Order complete" };
import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="relative min-h-[calc(100vh-8rem)] bg-neutral-950 text-white">
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold">Thank you!</h1>
        <p className="mt-2 text-white/70">Your payment was submitted. You will receive a receipt via email.</p>
        <div className="mt-6">
          <Link
            href="/"
            className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
