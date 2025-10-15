import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_60%)]"
        style={{
          background:
            "radial-gradient(1200px_600px_at_80%_-10%, rgba(99,102,241,0.25), transparent 60%), radial-gradient(900px_500px_at_-10%_20%, rgba(34,197,94,0.22), transparent 60%), radial-gradient(700px_400px_at_50%_120%, rgba(244,114,182,0.18), transparent 60%)",
        }}
      />
      <GridLines />

      {/* HERO */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-10 pt-8 md:pb-20 md:pt-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/80">
            <StatusDot className="bg-emerald-400" /> Live demo surface for Stripe stablecoin flows
          </div>
          <h1 className="text-balance bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-4xl font-semibold leading-tight text-transparent md:text-6xl">
            Ship stablecoin experiences that feel native to your product
          </h1>
          <p className="mt-4 text-pretty text-base leading-relaxed text-white/70 md:text-lg">
            Stablecoin showcases on-ramp quotes, checkout concepts, and webhook
            handling patterns. Clean UI, safe defaults, and production-ready structure.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <CTA href="/onramp" primary>
              Try On-Ramp
            </CTA>
            <CTA href="/checkout">Try Checkout</CTA>
{/*             <CTA href="/docs">Docs (project)</CTA> */}
          </div>

          <TechBadges />
        </div>

        {/* Showcase Panel */}
        <div className="mx-auto mt-12 max-w-6xl">
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2 text-xs text-white/60">
              <div className="flex items-center gap-2">
                <WindowDot className="bg-rose-500" />
                <WindowDot className="bg-amber-400" />
                <WindowDot className="bg-emerald-500" />
                <span className="ml-3">app/api/webhooks/route.ts — idempotent handler</span>
              </div>
              <span className="hidden md:block">TypeScript • Edge-safe • Retries</span>
            </div>
            <CodeBlock code={CODE_WEBHOOK} />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pb-12 md:pb-20">
        <h2 className="text-balance text-center text-2xl font-semibold md:text-3xl">What Stablecoin. demonstrates</h2>
        <p className="mx-auto mt-2 max-w-3xl text-center text-white/70">
          Opinionated patterns you can lift directly into production. Swap the Stablecoin. surfaces for your actual product
          flows.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <FeatureCard
            title="Instant quotes"
            body="Fetch stablecoin on-ramp quotes, map fees, and highlight net received amounts with clear UX."
            href="/onramp"
            icon={<IconBolt />}
          />
          <FeatureCard
            title="First-party checkout"
            body="Demonstrates a custom checkout surface with server actions, avoiding brittle client secrets."
            href="/checkout"
            icon={<IconCart />}
          />
          <FeatureCard
            title="Robust webhooks"
            body="Idempotency keys, replay protection, and deterministic state transitions for money movement."
            href="/"
            icon={<IconShield />}
          />
        </div>
      </section>
    </main>
  );
}

/* --------------------------------- UI ---------------------------------- */
function CTA(
  props: (
    | { href: string; primary?: boolean; target?: string; rel?: string; children: React.ReactNode }
    | (React.AnchorHTMLAttributes<HTMLAnchorElement> & { primary?: boolean })
  )
) {
  const { primary, children, ...rest } = props as any;
  const classes = primary
    ? "rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black shadow-xl transition hover:bg-white/90"
    : "rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/10";
  return (
    <a className={classes} {...(rest as any)}>
      {children}
    </a>
  );
}

function TechBadges() {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-white/60">
      <Badge>Next.js App Router</Badge>
      <Badge>TypeScript</Badge>
      <Badge>Tailwind</Badge>
      <Badge>Server Actions</Badge>
      <Badge>Stripe Webhooks</Badge>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1">{children}</span>
  );
}

function FeatureCard({
  title,
  body,
  href,
  icon,
}: {
  title: string;
  body: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:translate-y-[-2px] hover:border-white/20 hover:bg-white/10"
    >
      <div className="absolute inset-0 -z-10 opacity-0 transition group-hover:opacity-100" aria-hidden>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-emerald-500/10 to-pink-500/10" />
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-white/10 bg-black/30 p-2">{icon}</div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{body}</p>
      <div className="mt-4 inline-flex items-center gap-1 text-sm text-white/80">
        Explore <ArrowIcon />
      </div>
    </Link>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-white/90">
      <code>{code}</code>
    </pre>
  );
}

function GridLines() {
  return (
    <svg className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-[0.08]" aria-hidden>
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}

function StatusDot({ className = "" }: { className?: string }) {
  return <span className={`inline-block size-2 rounded-full ${className}`} />;
}

function WindowDot({ className = "" }: { className?: string }) {
  return <span className={`inline-block size-2.5 rounded-full ${className}`} />;
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" className="ml-0.5 size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="17" cy="20" r="1.5" />
      <path d="M3 3h2l3 12h10l2-8H6" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2l7 4v6c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-4z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

/* ---------------------------- Code Samples ---------------------------- */
const CODE_WEBHOOK = `import { headers } from "next/headers";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const sig = (await headers()).get("stripe-signature");
  const raw = await req.text();

  // Verify signature early — avoid partially mutating state before trust.
  const event = verifyStripeSignature(raw, sig);

  // Idempotency guard: ensure we only apply each event once.
  const applied = await hasProcessed(event.id);
  if (applied) return Response.json({ ok: true });

  switch (event.type) {
    case "crypto.onramp.quote.created":
    case "crypto.onramp.session.updated":
    case "treasury.credit_reversal.created":
    case "transfer.created": {
      await applyStateTransition(event);
      break;
    }
    default: {
      // keep noisy events visible in logs without failing the webhook
      console.info("Unhandled event", event.type);
    }
  }

  await markProcessed(event.id);
  return Response.json({ ok: true });
}

// ——— helpers (server-only) ———
function verifyStripeSignature(raw: string, sig: string | null) {
  if (!sig) throw new Error("Missing signature");
  // stripe.webhooks.constructEvent(raw, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  // return event
  return { id: "evt_123", type: "transfer.created", data: { object: {} } } as any; // demo stub
}

async function hasProcessed(id: string) { return false; }
async function markProcessed(id: string) { /* persist */ }
async function applyStateTransition(event: any) { /* write durable state */ }
`;
