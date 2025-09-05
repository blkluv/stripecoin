# Stripe Stablecoin Starter — Next.js + Stripe (Crypto/Stablecoin)

> Ship stablecoin experiences that feel native to your product. This demo shows how to structure **on-ramp quotes**, a **crypto-aware checkout surface**, **verified webhooks**, and a **dashboard** you can evolve into real operational metrics — using **Next.js (App Router), TypeScript, Tailwind**, and Stripe.

**Live demo:** https://stripe-stablecoin-app.vercel.app/

---

## What’s inside

- **On-Ramp (Quotes UI + session kickoff scaffold)**  
  A first-party page to request fiat→crypto quotes, compare fees, and start an on-ramp session. The UI **gracefully degrades** if the account doesn’t have On-Ramp API access (empty state with guidance).
  
- **Checkout (Crypto-aware Payment Element / Checkout)**  
  A first-party checkout surface tuned for Crypto. If the account doesn’t have **Pay with Crypto** enabled, the UI explains why and avoids broken flows.

- **Webhooks (idempotent, verified, fan-out pattern)**  
  App Router webhook route with signature verification (raw body), idempotency guard, and event fan-out structure you can take to prod.

- **Dashboard (metrics shell)**  
  A place to surface volume, method mix (crypto vs. fiat), trends, and recent payments. Currently a scaffold you can back with Stripe data.

---

## Why this repo (role-aligned)

Stripe’s **Integration Engineer, Stablecoin** work = multi-product integrations + enablement variance + production-ready patterns:

- Crypto **on-ramp quotes** & **sessions** (API-first)
- **Pay with Crypto** via Checkout/Elements (proper enablement & fallbacks)
- **Webhooks** with verified raw bodies, replay/idempotency
- Future path: **Connect stablecoin payouts** (private preview in many regions)

This project demonstrates those constraints and documents the tradeoffs plainly.

---

## Live pages

- **Home:** context + links to all flows  
- **On-Ramp:** `/onramp` — quote request UI (empty state if API not enabled)  
- **Checkout:** `/checkout` — first-party checkout surface; explains when Crypto isn’t enabled  
- **Dashboard:** `/dashboard` — metrics scaffold (totals, mix, recent payments)

---

## Architecture

- **Framework:** Next.js (App Router) + TypeScript + Tailwind
- **Key routes (representative):**
  - `app/onramp/page.tsx` — quotes UI + session kickoff (server actions or API routes)
  - `app/checkout/page.tsx` — Payment Element/Checkout surface tuned for Crypto
  - `app/api/webhooks/route.ts` — Stripe webhook handler  
    > Run on **Node runtime** to access the raw request body for signature verification:  
    > `export const runtime = 'nodejs'`
  - `app/dashboard/page.tsx` — metrics shell
- **Lib & utils:** helpers for Stripe calls, idempotency, and formatting

> Note: Some crypto namespaces may not be fully exposed in `stripe-node` typings yet. It’s fine to call REST endpoints directly for `/v1/crypto/*` and keep `stripe-node` for core objects.

## Prereqs

- **Node 18+**
- **Stripe account** with appropriate enablement:
  - **Pay with Crypto** (stablecoin payments) — request enablement in Dashboard
  - **On-Ramp API** — access controlled; the UI handles lack of access by design
- **Stripe CLI** (optional but recommended) for local webhooks & test events

---

## Quick start

```bash
# 1) Install
npm install    # or npm/yarn

# 2) Environment
cp .env.example .env.local
# Fill in keys (see table below)

# 3) Dev server
npm run dev        # http://localhost:3000

# 4) (Optional) Webhooks in dev
stripe login
stripe listen --forward-to localhost:3000/api/webhooks
# Copy the 'Signing secret' (whsec_...) into STRIPE_WEBHOOK_SECRET
