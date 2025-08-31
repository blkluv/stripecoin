// app/onramp/confirm/page.tsx
import { Suspense } from "react";
import ConfirmClient from "./ConfirmClient";

export const dynamic = "force-dynamic"; // avoids static export trying to pre-render params

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SP>; // <-- async in newer Next
}) {
  const sp = await searchParams; // <-- await before property access

  const params = {
    id: one(sp.id) ?? "",
    network: one(sp.network) ?? "",
    currency: one(sp.currency) ?? "",
    // prefer destination_amount; keep backward-compat with older query keys
    destination_amount: one(sp.destination_amount) ?? one(sp.dest_amount) ?? "",
    source_amount: one(sp.source_amount),// ?? one(sp.source_total_amount) ?? "",
  };

  return (
    <Suspense fallback={<div className="p-6 text-white/70">Loading…</div>}>
      <ConfirmClient {...params} />
    </Suspense>
  );
}
