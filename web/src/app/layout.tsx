import type { Metadata, Viewport } from "next";
import { Anek_Devanagari, Mukta } from "next/font/google";
import localFont from "next/font/local";
import { SwRegister } from "@/components/SwRegister";
import { site } from "@/lib/site";
import "./globals.css";

// Only the Latin subsets are preloaded. The full Devanagari files are ~800 KB,
// and the page only ever shows the word प्रगति, which comes from `mark` below.
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

// 4 KB subset of Anek Devanagari (wdth 112.5, wght 800) holding just the glyphs
// for प्रगति, from fonts.googleapis.com with text=प्रगति. Regenerate the same way
// if more Devanagari text is added to the page.
const mark = localFont({
  src: "../fonts/pragati-mark.woff2",
  variable: "--font-mark",
  weight: "800",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: site.title,
  description: site.description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: site.title,
    description: site.description,
    url: "/",
    siteName: site.name,
    locale: "en_AU",
  },
  appleWebApp: { capable: true, title: "Pragati", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F8FB" },
    { media: "(prefers-color-scheme: dark)", color: site.themeColor },
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: site.name,
  url: site.url,
  email: site.email,
  description: site.description,
  areaServed: [
    { "@type": "Country", name: "Australia" },
    { "@type": "Country", name: "Nepal" },
  ],
  address: [
    { "@type": "PostalAddress", addressLocality: "Sydney", addressRegion: "NSW", addressCountry: "AU" },
    { "@type": "PostalAddress", addressLocality: "Kathmandu", addressCountry: "NP" },
  ],
  knowsLanguage: ["en", "ne"],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-AU" className={`${display.variable} ${body.variable} ${mark.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SwRegister />
      </body>
    </html>
  );
}
