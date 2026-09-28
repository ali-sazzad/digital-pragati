# Digital Pragati — Benchmark Test Cases

Derived from what the strongest agency sites do well, then raised one notch so Pragati beats them.

**Benchmark set**
- Global craft: Awwwards Sites of the Day (Sep 2026), Wavespace, Hello Monday, Immersive Garden — scored on design, usability, creativity, content (SOTD scores typically 7.45–8.65/10).
- Sydney lead-gen competitors: Pixel Fish, DSIGNS, Q Agency, Click Click Media, Small Business Web Designs.
- Kathmandu competitors: Genesis Web Technology, Webtech Nepal, Softbenz, Imagine Web Solution, YetiStudio.

**Pattern → Pragati answer**
| What the leaders do | Where they fall short | Pragati's rule |
|---|---|---|
| Value prop + "Book a call" above the fold (Wavespace, Q Agency) | Generic "we build amazing websites" copy (most Kathmandu sites) | Hero names *who* we serve in both markets and the outcome |
| Social proof: Google reviews, "1,000+ clients", awards | Unverifiable numbers | Only verifiable proof: this page measures its own speed live on the visitor's device; concept work is labelled as concept |
| Free 30-min strategy call (Q Agency), FAQ on cost & timeline (DSIGNS, Q Agency) | Vague timelines ("no fixed timeline") | Written week-by-week process and a written performance pledge |
| Local SEO + trust for Sydney small business | Single-market | Dual market AU/NP switch, AUD/NPR quoting, eSewa/Khalti/Fonepay pathways |
| Core Web Vitals marketed by everyone | Many agency sites fail their own CWV | Pragati ships under the thresholds and tests it |

---

## Test cases

Legend: **A** = automated in `tests/pragati.spec.ts`, **M** = manual review.

### 1. Hero & message (first 5 seconds)
| ID | Test | Pass criterion | Type |
|---|---|---|---|
| HERO-01 | Single, specific H1 | Exactly one `<h1>`, 4–14 words, names the audience or outcome | A |
| HERO-02 | Primary CTA above the fold | "Book a free strategy call" CTA visible without scrolling at 360×740 and 1440×900 | A |
| HERO-03 | Both markets named in first screen | "Australia" and "Nepal" both visible in hero | A |
| HERO-04 | No AI/automation language anywhere | Page text contains none of: AI-generated, AI-powered, template, drag-and-drop, push-button | A |
| HERO-05 | Content visible at rest | No hero text left at opacity 0 after load | A |

### 2. Trust & proof
| ID | Test | Pass criterion | Type |
|---|---|---|---|
| TRUST-01 | Live self-measured performance | Page shows its own LCP and CLS read from the browser's PerformanceObserver | A |
| TRUST-02 | No fabricated proof | No testimonials, star ratings or client counts that cannot be verified; concept work carries a "Concept" label | A |
| TRUST-03 | Written performance pledge | Pledge lists numeric thresholds (LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms, 48 px targets) | A |
| TRUST-04 | Presence in both cities | Sydney and Kathmandu named with live local times (AEST/AEDT and NPT) | A |
| TRUST-05 | Structured business data | JSON-LD `ProfessionalService` with `areaServed` AU + NP parses without error | A |

### 3. Conversion (CRO)
| ID | Test | Pass criterion | Type |
|---|---|---|---|
| CRO-01 | Short enquiry form | ≤ 6 visible fields, every field labelled | A |
| CRO-02 | Market-aware quoting | Choosing Nepal switches currency copy to NPR and shows eSewa/Khalti/Fonepay; Australia shows AUD | A |
| CRO-03 | Inline validation | Submitting empty shows field-level errors, focus moves to first error | A |
| CRO-04 | Success state | Valid submit shows a confirmation with response-time promise | A |
| CRO-05 | No public prices | No `$`, `AUD 1,234`, `Rs.` price figures on page (custom-quote policy) | A |
| CRO-06 | Persistent CTA on mobile | Fixed bottom bar with "Get a quote" visible at 360 px after scrolling | A |
| CRO-07 | CTA count | ≥ 3 routes to contact across the page | A |

### 4. Performance (Core Web Vitals)
| ID | Test | Pass criterion | Type |
|---|---|---|---|
| PERF-01 | LCP on throttled mobile | LCP ≤ 2.0 s (4× CPU slowdown, 1.6 Mbps / 150 ms RTT) — beats Google's 2.5 s "good" | A |
| PERF-02 | Layout stability | CLS ≤ 0.05 (half Google's 0.1) | A |
| PERF-03 | Page weight | HTML + CSS + JS (excluding web fonts) ≤ 90 KB uncompressed | A |
| PERF-04 | No render-blocking third-party JS | Zero external `<script>` tags | A |
| PERF-05 | Fonts don't block text | Google Fonts requested with `display=swap`, preconnect present | A |
| PERF-06 | Interaction latency | Market toggle updates DOM in < 100 ms | A |

### 5. Accessibility (WCAG 2.2 AA)
| ID | Test | Pass criterion | Type |
|---|---|---|---|
| A11Y-01 | axe-core scan | 0 serious/critical violations, light and dark | A |
| A11Y-02 | Touch targets | Every interactive element ≥ 48×48 px at 360 px width | A |
| A11Y-03 | Keyboard | Skip link first in tab order; focus ring visible | A |
| A11Y-04 | Reduced motion | `prefers-reduced-motion: reduce` disables animation | A |
| A11Y-05 | Language | `<html lang="en-AU">`; Devanagari text marked `lang="ne"` | A |
| A11Y-06 | Heading order | No skipped heading levels | A |

### 6. SEO
| ID | Test | Pass criterion | Type |
|---|---|---|---|
| SEO-01 | Title | 30–65 characters, includes "Web Design" | A |
| SEO-02 | Meta description | 120–160 characters | A |
| SEO-03 | Canonical + Open Graph | canonical, og:title, og:description, og:type present | A |
| SEO-04 | Crawl files | robots.txt references sitemap.xml; sitemap valid XML | A |
| SEO-05 | Local keywords | Page text includes "Sydney", "Kathmandu", "Pokhara" | A |

### 7. PWA
| ID | Test | Pass criterion | Type |
|---|---|---|---|
| PWA-01 | Manifest | Linked, `display: standalone`, `start_url`, theme colour, 192 & 512 icons (one maskable) | A |
| PWA-02 | Service worker | Registers and controls the page on second load | A |
| PWA-03 | Offline | With network off, reload still renders home; unknown URL shows offline page | A |
| PWA-04 | iOS | `apple-touch-icon` and `theme-color` meta present | A |

### 8. Mobile & responsive
| ID | Test | Pass criterion | Type |
|---|---|---|---|
| MOB-01 | No horizontal scroll | `scrollWidth ≤ innerWidth` at 320, 360, 768, 1024, 1440 | A |
| MOB-02 | Mobile bottom nav | Fixed bottom nav at < 768 px, hidden ≥ 768 px | A |
| MOB-03 | Readable text | Body text ≥ 16 px on mobile | A |

### 9. Themes & craft
| ID | Test | Pass criterion | Type |
|---|---|---|---|
| UX-01 | Dark mode | Dark colour scheme renders with body background changed and axe passes | A |
| UX-02 | FAQ answers cost & timeline | FAQ contains questions on cost, timeline, ownership | A |
| UX-03 | Visual review vs Awwwards criteria | Design, usability, creativity, content each self-scored ≥ 8/10 by a reviewer who didn't build it | M |
