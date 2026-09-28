import { getDb } from "@/lib/db";
import type { Enquiry } from "@/lib/enquiry";
import { deliverEnquiry } from "@/lib/mailer";

export type EmailStatus = "pending" | "sent" | "logged" | "not-configured" | "failed";

export type StoredEnquiry = Enquiry & { id: number; created_at: Date; email_status: EmailStatus };

// Saves first, then emails, then records how the email went. An enquiry counts
// as received if either step worked: a Gmail outage never loses a saved
// enquiry, and a database outage never blocks the email.
export async function receiveEnquiry(enquiry: Enquiry): Promise<{ received: boolean }> {
  let id: number | undefined;
  try {
    const db = await getDb();
    const [row] = await db.query<{ id: number }>(
      `insert into enquiries (source, market, name, business, email, phone, need, message)
       values ($1, $2, $3, $4, $5, $6, $7, $8) returning id`,
      [
        enquiry.source,
        enquiry.market,
        enquiry.name,
        enquiry.business,
        enquiry.email || null,
        enquiry.phone || null,
        enquiry.need || null,
        enquiry.message || null,
      ],
    );
    id = row.id;
  } catch (err) {
    console.error("Enquiry not saved to the database", err, enquiry);
  }

  let status: EmailStatus;
  try {
    status = await deliverEnquiry(enquiry, id);
  } catch (err) {
    console.error("Enquiry email failed", err);
    status = "failed";
  }

  if (id !== undefined) {
    try {
      const db = await getDb();
      await db.query("update enquiries set email_status = $1 where id = $2", [status, id]);
    } catch (err) {
      console.error("Could not record email status", err);
    }
  }

  const emailed = status === "sent" || status === "logged";
  return { received: id !== undefined || emailed };
}

export async function listEnquiries(limit = 200): Promise<StoredEnquiry[]> {
  const db = await getDb();
  return db.query<StoredEnquiry>(
    `select id, created_at, source, market, name, business,
            coalesce(email, '') as email, coalesce(phone, '') as phone,
            coalesce(need, '') as need, coalesce(message, '') as message, email_status
       from enquiries order by created_at desc limit $1`,
    [limit],
  );
}
