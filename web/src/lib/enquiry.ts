export type EnquiryField = "name" | "business" | "email" | "phone" | "message";
export type EnquiryErrors = Partial<Record<EnquiryField | "contact" | "need", string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (s: string) => emailPattern.test(s.trim());
const digits = (s: string) => s.replace(/[^\d]/g, "").length;

const limits = { name: 120, business: 160, email: 254, phone: 40, need: 80, message: 4000 } as const;

function checkLengths(data: Partial<Record<keyof typeof limits, string>>, errors: EnquiryErrors) {
  for (const [field, max] of Object.entries(limits) as [keyof typeof limits, number][]) {
    if ((data[field]?.length ?? 0) > max && !errors[field]) errors[field] = `Keep this under ${max} characters.`;
  }
}

// The Next.js form: email and a short message are required.
// Shared by the browser (instant feedback) and the server (source of truth).
export function validateEnquiry(data: Record<EnquiryField, string>): EnquiryErrors {
  const errors: EnquiryErrors = {};
  if (!data.name.trim()) errors.name = "Enter your name.";
  if (!data.business.trim()) errors.business = "Enter your business name.";
  if (!data.email.trim()) errors.email = "Enter your email address.";
  else if (!emailPattern.test(data.email.trim())) errors.email = "Enter an email address like name@business.com.";
  if (data.phone.trim() && digits(data.phone) < 8)
    errors.phone = "Enter a phone number with at least 8 digits, or leave it blank.";
  if (data.message.trim().length < 10) errors.message = "Tell us a little about your business (at least 10 characters).";
  checkLengths(data, errors);
  return errors;
}

// What gets stored and emailed, whichever form it came from.
export type Enquiry = {
  source: "site" | "static";
  market: "au" | "np";
  name: string;
  business: string;
  email: string;
  phone: string;
  need: string;
  message: string;
};

// The public API (used by the static site). Its form has one "email or phone"
// box, a "what do you need" menu and an optional message, and it may also send
// separate email/phone fields.
export function parseApiEnquiry(body: Record<string, unknown>): { enquiry: Enquiry; errors: EnquiryErrors } {
  const str = (k: string) => (typeof body[k] === "string" ? (body[k] as string).trim() : "");
  const contact = str("contact");
  const enquiry: Enquiry = {
    source: "static",
    market: str("market") === "np" ? "np" : "au",
    name: str("name"),
    business: str("business"),
    email: str("email") || (contact.includes("@") ? contact : ""),
    phone: str("phone") || (contact && !contact.includes("@") ? contact : ""),
    need: str("need"),
    message: str("message"),
  };

  const errors: EnquiryErrors = {};
  if (enquiry.name.length < 2) errors.name = "Enter your name so we know who to ask for.";
  if (enquiry.business.length < 2) errors.business = "Enter your business name.";
  const emailOk = emailPattern.test(enquiry.email);
  const phoneOk = digits(enquiry.phone) >= 8;
  if (!emailOk && !phoneOk) errors.contact = "Enter an email address or a phone number with at least 8 digits.";
  checkLengths(enquiry, errors);
  return { enquiry, errors };
}
