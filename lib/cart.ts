// ====================================================================
// lib/cart.ts — demo cart items (client + server safe)
// ====================================================================
export type CartItem = { id: string; name: string; qty: number; unit_amount: number };

export const DEMO_ITEMS: CartItem[] = [
  { id: "sku_boost", name: "API Throughput Boost", qty: 1, unit_amount: 1200 },
  { id: "sku_widget", name: "Pro Widget", qty: 2, unit_amount: 2999 },
];

