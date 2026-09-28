import type { Metadata } from "next";
import { connection } from "next/server";
import { listEnquiries, type EmailStatus, type StoredEnquiry } from "@/lib/enquiries";
import { markets } from "@/lib/site";

// Enquiries list. Password-protected by src/proxy.ts.

export const metadata: Metadata = { title: "Enquiries | Digital Pragati", robots: { index: false, follow: false } };

const statusLabel: Record<EmailStatus, string> = {
  sent: "Emailed",
  logged: "Logged only",
  "not-configured": "Not emailed: Gmail not set up",
  failed: "Email failed",
  pending: "Email pending",
};

const when = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Australia/Sydney",
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export default async function Admin() {
  await connection(); // always read fresh rows, never at build time

  let rows: StoredEnquiry[] = [];
  let loadError = false;
  try {
    rows = await listEnquiries();
  } catch (err) {
    console.error("Could not load enquiries", err);
    loadError = true;
  }

  return (
    <main id="main" className="section">
      <div className="wrap">
        <h1 className="admin-title">Enquiries</h1>
        <p className="muted">
          Newest first, times in Sydney. Showing {rows.length} {rows.length === 1 ? "enquiry" : "enquiries"}.
        </p>

        {loadError ? (
          <p className="form-error" role="alert">
            The database isn&rsquo;t reachable. Check DATABASE_URL, then reload this page.
          </p>
        ) : rows.length === 0 ? (
          <p>No enquiries yet. They appear here as soon as someone sends the form on either site.</p>
        ) : (
          <div className="admin-table-wrap" role="region" aria-label="Enquiries" tabIndex={0}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">Received</th>
                  <th scope="col">Who</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Market</th>
                  <th scope="col">Message</th>
                  <th scope="col">Email</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {when.format(new Date(r.created_at))}
                      <span className="admin-sub">
                        #{r.id}, {r.source === "static" ? "static site" : "main site"}
                      </span>
                    </td>
                    <td>
                      <strong>{r.name}</strong>
                      <span className="admin-sub">{r.business}</span>
                    </td>
                    <td>
                      {r.email && <a href={`mailto:${r.email}`}>{r.email}</a>}
                      {r.phone && <span className="admin-sub">{r.phone}</span>}
                    </td>
                    <td>{markets[r.market]?.label ?? r.market}</td>
                    <td className="admin-message">
                      {r.need && <span className="admin-need">{r.need}</span>}
                      {r.message}
                    </td>
                    <td>
                      <span className={`admin-status admin-status-${r.email_status}`}>{statusLabel[r.email_status]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
