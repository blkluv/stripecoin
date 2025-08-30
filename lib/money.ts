// ====================================================================
// lib/money.ts — helpers
// ====================================================================
import type { CartItem } from "@/lib/cart";

export function formatUSD(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

export function lineTotal(it: CartItem) {
  return it.qty * it.unit_amount;
}

export function subtotalCents(items: CartItem[]) {
  return items.reduce((sum, it) => sum + lineTotal(it), 0);
}

export function computeDiscount(code: string, subtotal: number) {
  if (!code) return 0;
  if (code.toUpperCase() === "SAVE10") return Math.round(subtotal * 0.1);
  return 0;
}