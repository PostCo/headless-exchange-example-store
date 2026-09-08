import type { ReactNode } from "react";
import Link from "next/link";
import { CartProvider } from "@/cart/CartContext";
import { SiteNav } from "@/components/SiteNav";
import { ExchangeStatusBar } from "@/components/ExchangeStatusBar";
import "./globals.css";

export const metadata = {
  title: {
    template: "%s · Sunday Supply",
    default: "Sunday Supply",
  },
  description: "A local headless storefront for Shopify Storefront checkout.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <ExchangeStatusBar />
          <header className="site-header">
            <Link className="site-title" href="/">
              Sunday Supply
            </Link>
            <SiteNav />
          </header>
          <main className="site-main">{children}</main>
          <footer className="site-footer">
            <p>Sunday Supply Co.</p>
            <p>Apparel, goods, and the occasional gift card.</p>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
