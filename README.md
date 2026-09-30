# Digital Pragati

**Websites that turn visitors into booked customers.**

We design and engineer fast, custom websites and booking platforms for Nepalese-owned businesses across Australia and growing businesses in Nepal. Clear copy, local search visibility and speed you can measure.

*Pragati* (प्रगति) means progress: progress, built for the web. Quotes in AUD for Australia and NPR for Nepal.

**Live site:** [digital-pragati.vercel.app](https://digital-pragati.vercel.app) (also on [GitHub Pages](https://ali-sazzad.github.io/digital-pragati/)). Developer setup is at the [end of this page](#run-the-website).

## Two markets, one standard

Built for how your customers actually search and pay.

### Australia

For Nepalese-owned businesses in Sydney, Melbourne, Brisbane and beyond. Your customers compare three or four providers on their phone before they call. We build the site that wins that comparison, then keep it ranking in local search.

*Custom quote in AUD, with an optional monthly performance retainer.*

| Business | What we build |
| --- | --- |
| Education consultancies | Course finders, counselling-session booking and document checklists that reduce back-and-forth. |
| Migration agents | Clear service pages, MARA registration shown up front, consultation booking with pre-screening questions. |
| Restaurants | Fast menus, table and catering enquiries, Google Business Profile aligned with the site. |
| Cleaning and trades | Suburb landing pages, quote forms that capture the job details, click-to-call on every screen. |

### Nepal

For hotels, institutes and SMEs across Kathmandu, Pokhara and Chitwan. Your guests and students arrive on everything from Wi-Fi to patchy 3G. We build installable web apps that load fast, keep working offline and take local payments.

*Custom quote in NPR, with an optional monthly maintenance retainer. Payments by eSewa, Khalti or Fonepay QR.*

| Business | What we build |
| --- | --- |
| Hotels and resorts | Thamel and Lakeside properties: room pages, direct booking enquiries and deposit links that cut OTA commission. |
| IELTS and PTE institutes | Class schedules, mock-test registration and fee payment by wallet or QR. |
| Trekking agencies | Itinerary pages that rank internationally, with offline-ready trip details for guests. |
| SMEs | A professional front door with Nepali and English content and a clear enquiry path. |

## What we build

Four services, focused on one outcome: more enquiries.

- **Lead-generation websites.** Custom-designed pages with copy written around your customers' questions and a clear path to contact. Conversion-focused page structure; copywriting in English and Nepali.
- **Booking and enquiry flows.** Appointment, consultation, room and class booking that fits in a thumb's reach on a phone. Calendar and reminder integrations; deposit links via eSewa, Khalti or Stripe.
- **Local SEO.** Rank for "near me" and suburb searches in Australia, and for travellers searching Kathmandu and Pokhara. Google Business Profile alignment; structured data and suburb pages.
- **Progressive web apps.** Installable, offline-ready sites that behave like an app without an app-store download. Offline pages and cached content; Add to Home Screen on Android and iOS.

## Concept builds

How we would approach three typical briefs. These are studio concepts, not client projects.

| Concept | Brief | Flow |
| --- | --- | --- |
| Migration agency, Parramatta | A consultation funnel that asks visa type and timeline before booking, so the agent's first call is already qualified. Suburb pages across Western Sydney. | Visa finder → pre-screen → book |
| Lakeside hotel, Pokhara | Direct booking enquiries with a Khalti or eSewa deposit, and room details cached for guests on weak mobile signal. Offline directions and check-in info. | Room → dates → deposit |
| PTE institute, Putalisadak | Batch schedules, mock-test sign-up and fee payment by Fonepay QR, with reminders before each class. A "PTE classes Kathmandu" landing page. | Batch → register → pay |

## Performance pledge

The numbers every launch has to hit. We test each site against these limits before handover. If a page misses one after launch, we fix it at no cost.

| Measure | Google's "good" | Our launch limit | Why it matters |
| --- | --- | --- | --- |
| Largest Contentful Paint | ≤ 2.5 s | ≤ 2.0 s | How fast the main content appears on a mid-range phone. |
| Interaction to Next Paint | ≤ 200 ms | ≤ 150 ms | How quickly buttons and forms respond to a tap. |
| Cumulative Layout Shift | ≤ 0.1 | ≤ 0.05 | Nothing jumps while the page loads, so nobody taps the wrong thing. |
| Touch target size | 24 px min | 48 px min | Every button is easy to hit with a thumb. |
| Accessibility | WCAG 2.2 AA | 0 serious issues | Readable and usable for everyone, in light and dark mode. |

Measured at the 75th percentile on a throttled 4G connection, the same way Google's Chrome UX Report scores real visitors. The website itself shows its own load speed, layout shift and page size, measured live in each visitor's browser.

## Process

From first call to launch in four to six weeks.

1. **Week 1: Strategy call and audit.** A free 30-minute call, then a review of your current site, competitors and the searches your customers make.
2. **Week 1–2: Structure and copy.** Page map, wireframes and conversion copy. You approve the words before we design around them.
3. **Week 2–4: Design and build.** Custom interface design and development, reviewed on your own phone through a private preview link.
4. **Week 4–5: Test and launch.** Speed, accessibility, forms and payments tested against our pledge, then go-live with search setup.
5. **Ongoing: Grow.** Optional monthly retainer covering hosting, updates, search reporting and conversion improvements.

## What business owners ask us first

**How much does a website cost?**
Every project is quoted to its scope: the number of pages, booking or payment features, and how much copywriting and SEO you need. Australian projects are quoted in AUD and Nepal projects in NPR. The strategy call is free and you get a written fixed quote afterwards.

**How long until my site is live?**
Most lead-generation sites launch in four to six weeks. Larger multi-page platforms take longer, and we give you the week-by-week plan before you sign.

**Do I own the website?**
Yes. Your domain, content and site are yours. If you ever leave, we hand over everything you need to move it.

**Can customers pay with eSewa, Khalti or Fonepay?**
Yes. For Nepal projects we set up deposit and payment pathways through eSewa, Khalti or Fonepay QR. For Australian projects we use Stripe or your existing booking system.

**Will I be able to update it myself?**
Yes. You get an editor for text, images and menus, plus a short recorded walkthrough. Retainer clients can also send changes to us.

**What is a progressive web app?**
A website that can be installed on a phone's home screen, loads instantly on repeat visits and keeps key pages working offline. It suits hotels, trekking agencies and institutes whose visitors are often on weak signal.

## Book your free 30-minute strategy call

Tell us a little about your business on the [website](https://digital-pragati.vercel.app/#contact). We'll review your current site before the call so the time is useful.

- Reply within one business day, Sydney or Kathmandu time
- Written fixed quote after the call
- No obligation and no lock-in contract

**Email:** forcraftcodestudio@gmail.com

---

## Run the website

The website is one plain HTML page, with a small Next.js backend that receives its enquiries.

| Folder | What it is |
| --- | --- |
| [`static-site/`](static-site/) | **The website**, and its only source: plain HTML, CSS and JavaScript with no build step. GitHub Pages publishes this folder as-is; Vercel serves the same files. |
| [`static-site/fx.js`](static-site/fx.js) | The animation layer: [GSAP](https://gsap.com) with ScrollTrigger for a reading-progress bar, word-by-word headings, scroll reveals, self-drawing service icons and the hero parallax, and [Motion](https://motion.dev) (the vanilla JavaScript version of Framer Motion) for spring hover and press feedback, magnetic main buttons and 3D tilting concept phones. The libraries are self-hosted in `static-site/vendor/`. |
| [`web/`](web/) | The Next.js app deployed on Vercel. At build time it copies `static-site/` into its `public/` folder and serves it at `/`. It adds the backend: the enquiry API, the database, email delivery and the password-protected enquiries list at `/admin`. |
| [`TEST-CASES.md`](TEST-CASES.md) | The quality bar the website is tested against. |

To run it locally you need Node.js 20.9 or newer:

```bash
cd web
npm install
npm run dev
```

Then open <http://localhost:3000>. Edit the website in `static-site/`, not `web/public/`: the copy in `web/public/` is regenerated every time the app starts or builds. Configuration, email and database setup, testing and deployment are covered in the [developer guide](web/README.md).

The animations are an extra layer on top of a page that is complete without them. They load only after the page has finished loading, so they never slow down the first screen, and they are skipped entirely for visitors who turn on reduced motion. They move things with opacity and transforms only, so nothing on the page jumps.
