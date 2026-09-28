import { CityClocks } from "@/components/CityClocks";
import { EnquiryForm } from "@/components/EnquiryForm";
import { LiveVitals } from "@/components/LiveVitals";
import { Ridge } from "@/components/Ridge";
import { concepts, faqs, markets, outOfScope, pledge, process, services, site } from "@/lib/site";

const nav = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "Process" },
  { href: "#work", label: "Work" },
  { href: "#faq", label: "FAQ" },
];

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="wrap header-inner">
          <a href="#main" className="wordmark" aria-label="Pragati Digital, home">
            <span lang="ne" className="wordmark-ne">प्रगति</span>
            <span className="wordmark-en">Pragati Digital</span>
          </a>
          <nav aria-label="Main" className="top-nav">
            {nav.map((n) => (
              <a key={n.href} href={n.href}>
                {n.label}
              </a>
            ))}
          </nav>
          <a href="#contact" className="btn btn-primary btn-small">
            Book a free strategy call
          </a>
        </div>
      </header>

      <main id="main">
        <section className="hero" aria-labelledby="hero-title">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <h1 id="hero-title">
                Websites that win enquiries for Nepali-owned businesses in Australia and Nepal
              </h1>
              <p className="lede">
                We plan it, write it, build it and get it found on Google. You get a site that loads fast on a
                phone and turns visitors into calls, bookings and quote requests. Quoted in AUD or NPR.
              </p>
              <div className="hero-actions">
                <a href="#contact" className="btn btn-primary">
                  Book a free strategy call
                </a>
                <a href="#process" className="btn btn-quiet">
                  See how a project runs
                </a>
              </div>
            </div>
            <div className="hero-mark" aria-hidden="true">
              <span lang="ne" className="mark-ne">प्रगति</span>
              <span className="mark-gloss">pragati, noun: progress</span>
            </div>
          </div>
        </section>

        <section className="band" aria-labelledby="band-title">
          <div className="wrap band-grid">
            <div>
              <h2 id="band-title" className="band-title">
                One team in Sydney and Kathmandu
              </h2>
              <CityClocks />
            </div>
            <div>
              <p className="band-title">This page, measured on your device just now</p>
              <LiveVitals />
            </div>
            <Ridge />
          </div>
        </section>

        <section className="section" aria-labelledby="markets-title">
          <div className="wrap">
            <h2 id="markets-title">Who we build for</h2>
            <div className="markets">
              {Object.values(markets).map((m) => (
                <article key={m.label} className="market">
                  <h3>{m.label}</h3>
                  <p>{m.who}</p>
                  <p className="muted">{m.focus}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="services" className="section section-tint" aria-labelledby="services-title">
          <div className="wrap">
            <h2 id="services-title">What you get</h2>
            <ul className="services">
              {services.map((s) => (
                <li key={s.title}>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ul>
            <p className="scope-note">{outOfScope}</p>
          </div>
        </section>

        <section id="process" className="section" aria-labelledby="process-title">
          <div className="wrap">
            <h2 id="process-title">Four weeks, written down</h2>
            <ol className="process">
              {process.map((p) => (
                <li key={p.when}>
                  <span className="process-when">{p.when}</span>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </li>
              ))}
            </ol>
            <p className="muted">
              After launch, monthly care is optional: hosting, updates and a short performance report each month.
            </p>
          </div>
        </section>

        <section className="section section-night" aria-labelledby="pledge-title">
          <div className="wrap pledge-grid">
            <div>
              <h2 id="pledge-title">Our performance pledge</h2>
              <p>
                Every site we launch meets these numbers on a mid-range phone. If it doesn&rsquo;t at handover, we
                fix it before you pay the final invoice.
              </p>
            </div>
            <table className="pledge">
              <caption className="visually-hidden">Performance targets for every site</caption>
              <thead>
                <tr>
                  <th scope="col">Measure</th>
                  <th scope="col">Target</th>
                  <th scope="col">What it means for your customers</th>
                </tr>
              </thead>
              <tbody>
                {pledge.map((p) => (
                  <tr key={p.metric}>
                    <th scope="row">{p.metric}</th>
                    <td className="pledge-target" data-label="Target">
                      {p.target}
                    </td>
                    <td className="pledge-why">{p.plain}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="work" className="section" aria-labelledby="work-title">
          <div className="wrap">
            <h2 id="work-title">Concept work</h2>
            <p className="section-intro">
              We&rsquo;re a new studio, so rather than borrow logos we&rsquo;ve designed concepts for the kinds of
              businesses we serve. Each is labelled as a concept.
            </p>
            <ul className="concepts">
              {concepts.map((c) => (
                <li key={c.name} className={`concept tone-${c.tone}`}>
                  <div className="concept-frame" aria-hidden="true">
                    <span className="cf-bar" />
                    <span className="cf-title">{c.name}</span>
                    <span className="cf-line" />
                    <span className="cf-line cf-short" />
                    <span className="cf-btn" />
                  </div>
                  <p className="concept-tag">Concept</p>
                  <h3>{c.name}</h3>
                  <p className="muted">{c.place}</p>
                  <p>{c.brief}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="faq" className="section section-tint" aria-labelledby="faq-title">
          <div className="wrap faq-wrap">
            <h2 id="faq-title">Questions owners ask us</h2>
            <div className="faq">
              {faqs.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="section" aria-labelledby="contact-title">
          <div className="wrap contact-grid">
            <div>
              <h2 id="contact-title">Book a free strategy call</h2>
              <p>
                Thirty minutes, in Nepali or English. We&rsquo;ll look at your current site or listing, tell you what
                we&rsquo;d change first, and send a fixed quote afterwards.
              </p>
              <p className="muted">
                Prefer email? Write to{" "}
                <a className="tap-link" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
                .
              </p>
            </div>
            <EnquiryForm />
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <p>
            <span lang="ne">प्रगति</span> Pragati Digital
          </p>
          <p>Sydney, Kathmandu and Pokhara</p>
          <p>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
        </div>
      </footer>

      <nav className="mobile-bar" aria-label="Quick links">
        <a href="#services">Services</a>
        <a href="#faq">FAQ</a>
        <a href="#contact" className="mobile-bar-cta">
          Get a quote
        </a>
      </nav>
    </>
  );
}
