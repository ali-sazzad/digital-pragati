// Business details used by the backend and the app's own pages (admin, offline,
// 404, robots, sitemap, enquiry emails). The website's copy lives in
// ../static-site/index.html, which is the home page.
// Points at the Vercel deployment until a custom domain is connected.
export const site = {
  name: "Digital Pragati",
  url: "https://digital-pragati.vercel.app",
  email: "forcraftcodestudio@gmail.com",
  title: "Nepali Business Web Design, Australia & Nepal | Digital Pragati",
  description:
    "Lead-generation websites for Nepali-owned businesses in Sydney, Kathmandu and Pokhara. Strategy, copywriting, local SEO and fast mobile builds, custom-quoted.",
  themeColor: "#0E2350",
};

// Markets an enquiry can come from, as shown in the admin list and emails.
export const markets = {
  au: { label: "Australia", currency: "AUD" },
  np: { label: "Nepal", currency: "NPR" },
} as const;

export type Market = keyof typeof markets;
