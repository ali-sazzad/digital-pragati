import type { Metadata, Viewport } from "next";
import { Anek_Devanagari, Mukta } from "next/font/google";
import { SwRegister } from "@/components/SwRegister";
import { site } from "@/lib/site";
import "./globals.css";

// This layout wraps only the app's own pages (/admin, /offline and the 404
// page). The home page is the static site in ../static-site, served from
// public/index.html; see next.config.ts.

const display = Anek_Devanagari({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const body = Mukta({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  // Copied from ../static-site/manifest.webmanifest at build time.
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "Pragati", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8FB" },
    { media: "(prefers-color-scheme: dark)", color: site.themeColor },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={`${display.variable} ${body.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <SwRegister />
      </body>
    </html>
  );
}
