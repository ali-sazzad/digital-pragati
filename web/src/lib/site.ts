// Single source for business facts and page copy.
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

export const markets = {
  au: {
    label: "Australia",
    currency: "AUD",
    payments: ["Bank transfer", "Card"],
    who: "Migration agents, education consultancies, restaurants, cleaning and trade businesses across Sydney, Melbourne and Brisbane.",
    focus:
      "Built to bring in enquiries: calls, quote requests and consultation bookings from people searching nearby.",
  },
  np: {
    label: "Nepal",
    currency: "NPR",
    payments: ["eSewa", "Khalti", "Fonepay", "Bank transfer"],
    who: "Hotels and guesthouses in Thamel and Pokhara, PTE and IELTS institutes, and growing local businesses.",
    focus:
      "Built for direct bookings and admissions, so fewer of your customers arrive through commission platforms.",
  },
} as const;

export type Market = keyof typeof markets;

export const services = [
  {
    title: "A four-part site that does one job well",
    body: "Home, About, Services and a Contact form. Every page leads to the same place: a customer getting in touch.",
  },
  {
    title: "Copy written for your customers",
    body: "We interview you, then write every word. In English, with Nepali where your customers expect it.",
  },
  {
    title: "Found on Google, locally",
    body: "Google Business Profile set up or cleaned up, local search terms on every page, and structured data search engines can read.",
  },
  {
    title: "Fast on a mid-range phone",
    body: "Most of your visitors arrive on mobile data. We build for that first and test on real devices before launch.",
  },
];

export const outOfScope =
  "Online stores, booking engines and custom databases aren't part of our launch service. If your project needs one, we'll tell you on the first call and point you to someone who does it well.";

export const process = [
  {
    when: "Week 1",
    title: "Strategy call and brief",
    body: "We learn who your customers are and what a good enquiry looks like. You get a written plan and a fixed quote.",
  },
  {
    when: "Week 2",
    title: "Words and structure",
    body: "We write every page. You approve the copy before any design starts, so nothing is designed around placeholder text.",
  },
  {
    when: "Week 3",
    title: "Design and build",
    body: "Mobile first, in your brand. You review a working site on your own phone, not a picture of one.",
  },
  {
    when: "Week 4",
    title: "Launch and local SEO",
    body: "Domain, Google Business Profile, analytics and a handover session so you can update your own text and photos.",
  },
];

export const pledge = [
  { metric: "Largest Contentful Paint", target: "≤ 2.5 s", plain: "Main content shows within 2.5 seconds on a mobile connection." },
  { metric: "Cumulative Layout Shift", target: "≤ 0.1", plain: "Nothing jumps around while the page loads." },
  { metric: "Interaction to Next Paint", target: "≤ 200 ms", plain: "Buttons and menus respond without a noticeable delay." },
  { metric: "Tap targets", target: "≥ 48 px", plain: "Every button is easy to hit with a thumb." },
  { metric: "Accessibility", target: "WCAG 2.2 AA", plain: "Readable contrast, keyboard access and screen reader labels." },
];

export const concepts = [
  {
    name: "Himal Migration",
    place: "Parramatta, NSW",
    brief: "Consultation bookings for skilled and student visa enquiries.",
    tone: "night",
  },
  {
    name: "Phewa Lakeside Lodge",
    place: "Pokhara",
    brief: "Direct room enquiries by WhatsApp and email, with lake-view photos first.",
    tone: "lake",
  },
  {
    name: "Score Up PTE",
    place: "Kathmandu",
    brief: "Class schedule and trial-lesson sign-ups for PTE and IELTS students.",
    tone: "marigold",
  },
] as const;

export const faqs = [
  {
    q: "How much does a website cost?",
    a: "Every project is quoted on its scope and what it needs to achieve. You get a fixed quote in AUD or NPR after the strategy call, before any work starts, so there are no hourly surprises.",
  },
  {
    q: "How long does it take?",
    a: "Four weeks from an approved brief for a standard four-part site. The main thing that affects timing is how quickly we receive your photos, logo and feedback.",
  },
  {
    q: "Who owns the website and domain?",
    a: "You do. The domain is registered in your name, and the site, copy and images are yours once the final invoice is paid.",
  },
  {
    q: "Do I have to pay every month?",
    a: "No. Monthly care covering hosting, updates and a performance report is optional. You can also host the site yourself.",
  },
  {
    q: "Can we meet in Nepali?",
    a: "Yes. Calls and meetings run in Nepali or English, whichever suits you and your team.",
  },
  {
    q: "Can you build an online store?",
    a: "Not as part of our launch service. We focus on sites that bring in enquiries. If you need a store, we'll say so on the first call.",
  },
];
