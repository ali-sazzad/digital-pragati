"use server";

import { validateEnquiry, type EnquiryErrors } from "@/lib/enquiry";
import { receiveEnquiry } from "@/lib/enquiries";
import { site } from "@/lib/site";

export type EnquiryResult = { ok: true } | { ok: false; errors: EnquiryErrors; formError?: string };

const sendFailed = `We couldn't send your enquiry just now. Try again in a few minutes, or email us at ${site.email}.`;

export async function submitEnquiry(formData: FormData): Promise<EnquiryResult> {
  const get = (k: string) => String(formData.get(k) ?? "").trim();

  // Honeypot: people never see this field, bots fill it in. Pretend it worked.
  if (get("website")) return { ok: true };

  const data = {
    name: get("name"),
    business: get("business"),
    email: get("email"),
    phone: get("phone"),
    message: get("message"),
  };
  const errors = validateEnquiry(data);
  if (Object.keys(errors).length) return { ok: false, errors };

  const { received } = await receiveEnquiry({
    ...data,
    source: "site",
    market: get("market") === "np" ? "np" : "au",
    need: "",
  });
  return received ? { ok: true } : { ok: false, errors: {}, formError: sendFailed };
}
