# Digital Pragati

**Websites that win enquiries for Nepali-owned businesses in Australia and Nepal.**

We plan it, write it, build it and get it found on Google. You get a site that loads fast on a phone and turns visitors into calls, bookings and quote requests. Quoted in AUD or NPR.

*Pragati* (प्रगति) means progress. One team in Sydney and Kathmandu.

This repository is the Digital Pragati website. Developer setup is at the [end of this page](#run-the-website).

## Who we build for

### Australia

Migration agents, education consultancies, restaurants, cleaning and trade businesses across Sydney, Melbourne and Brisbane.

Built to bring in enquiries: calls, quote requests and consultation bookings from people searching nearby. Quoted in **AUD**; pay by bank transfer or card.

### Nepal

Hotels and guesthouses in Thamel and Pokhara, PTE and IELTS institutes, and growing local businesses.

Built for direct bookings and admissions, so fewer of your customers arrive through commission platforms. Quoted in **NPR**; pay by eSewa, Khalti, Fonepay or bank transfer.

## What you get

- **A four-part site that does one job well.** Home, About, Services and a Contact form. Every page leads to the same place: a customer getting in touch.
- **Copy written for your customers.** We interview you, then write every word. In English, with Nepali where your customers expect it.
- **Found on Google, locally.** Google Business Profile set up or cleaned up, local search terms on every page, and structured data search engines can read.
- **Fast on a mid-range phone.** Most of your visitors arrive on mobile data. We build for that first and test on real devices before launch.

Online stores, booking engines and custom databases aren't part of our launch service. If your project needs one, we'll tell you on the first call and point you to someone who does it well.

## Four weeks, written down

1. **Week 1: Strategy call and brief.** We learn who your customers are and what a good enquiry looks like. You get a written plan and a fixed quote.
2. **Week 2: Words and structure.** We write every page. You approve the copy before any design starts, so nothing is designed around placeholder text.
3. **Week 3: Design and build.** Mobile first, in your brand. You review a working site on your own phone, not a picture of one.
4. **Week 4: Launch and local SEO.** Domain, Google Business Profile, analytics and a handover session so you can update your own text and photos.

After launch, monthly care is optional: hosting, updates and a short performance report each month.

## Our performance pledge

Every site we launch meets these numbers on a mid-range phone. If it doesn't at handover, we fix it before you pay the final invoice.

| Measure | Target | What it means for your customers |
| --- | --- | --- |
| Largest Contentful Paint | ≤ 2.5 s | Main content shows within 2.5 seconds on a mobile connection. |
| Cumulative Layout Shift | ≤ 0.1 | Nothing jumps around while the page loads. |
| Interaction to Next Paint | ≤ 200 ms | Buttons and menus respond without a noticeable delay. |
| Tap targets | ≥ 48 px | Every button is easy to hit with a thumb. |
| Accessibility | WCAG 2.2 AA | Readable contrast, keyboard access and screen reader labels. |

The website itself is held to the same numbers: it measures its own load speed and layout shift in each visitor's browser and shows the result on the page.

## Concept work

We're a new studio, so rather than borrow logos we've designed concepts for the kinds of businesses we serve. Each is a concept, not a client project.

| Concept | Where | Brief |
| --- | --- | --- |
| Himal Migration | Parramatta, NSW | Consultation bookings for skilled and student visa enquiries. |
| Phewa Lakeside Lodge | Pokhara | Direct room enquiries by WhatsApp and email, with lake-view photos first. |
| Score Up PTE | Kathmandu | Class schedule and trial-lesson sign-ups for PTE and IELTS students. |

## Questions owners ask us

**How much does a website cost?**
Every project is quoted on its scope and what it needs to achieve. You get a fixed quote in AUD or NPR after the strategy call, before any work starts, so there are no hourly surprises.

**How long does it take?**
Four weeks from an approved brief for a standard four-part site. The main thing that affects timing is how quickly we receive your photos, logo and feedback.

**Who owns the website and domain?**
You do. The domain is registered in your name, and the site, copy and images are yours once the final invoice is paid.

**Do I have to pay every month?**
No. Monthly care covering hosting, updates and a performance report is optional. You can also host the site yourself.

**Can we meet in Nepali?**
Yes. Calls and meetings run in Nepali or English, whichever suits you and your team.

**Can you build an online store?**
Not as part of our launch service. We focus on sites that bring in enquiries. If you need a store, we'll say so on the first call.

## Book a free strategy call

Thirty minutes, in Nepali or English. We'll look at your current site or listing, tell you what we'd change first, and send a fixed quote afterwards.

- **Website:** [digital-pragati.vercel.app](https://digital-pragati.vercel.app)
- **Email:** forcraftcodestudio@gmail.com
- **Where we work:** Sydney, Kathmandu and Pokhara

We reply within one business day, Sydney or Kathmandu time.

---

## Run the website

The repository contains:

| Folder | What it is |
| --- | --- |
| [`web/`](web/) | The main website, built with Next.js 16: landing page, enquiry form, enquiry backend (database + email) and a password-protected enquiries list. |
| [`static-site/`](static-site/) | A standalone HTML version of the website. Its enquiry form sends to the main site's backend. |
| [`TEST-CASES.md`](TEST-CASES.md) | The quality bar the website is tested against. |

To run the main website you need Node.js 20.9 or newer:

```bash
cd web
npm install
npm run dev
```

Then open <http://localhost:3000>. Configuration, email and database setup, testing and deployment are covered in the [developer guide](web/README.md).
