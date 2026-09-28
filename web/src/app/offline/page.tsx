import type { Metadata } from "next";

export const metadata: Metadata = { title: "You're offline | Digital Pragati", robots: { index: false } };

export default function Offline() {
  return (
    <main id="main" className="section">
      <div className="wrap">
        <h1>You&rsquo;re offline</h1>
        <p>This page isn&rsquo;t saved on your device. Reconnect to the internet, then reload to continue.</p>
        {/* A full page load, not client routing, so the service worker can serve the cached home page. */}
        <a className="btn btn-primary" href="/">
          Go to the home page
        </a>
      </div>
    </main>
  );
}
