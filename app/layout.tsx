import type { Metadata } from "next";
import "./globals.css";
import SiteNav from "./components/SiteNav";
import SiteFooter from "./components/SiteFooter";


export const metadata: Metadata = {
  title: "Stripe Stablecoin Starter",
  description:
  "A polished demo showcasing Stripe stablecoin onramp, checkout concepts, and webhook handling.",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-white antialiased">
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
