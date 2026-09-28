export type EnquiryErrors = Partial<Record<"name" | "business" | "email" | "phone" | "contact" | "need" | "message", string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isEmail = (s: string) => emailPattern.test(s.trim());
const digits = (s: string) => s.replace(/[^\d]/g, "").length;

const limits = { name: 120, business: 160, email: 254, phone: 40, need: 80, message: 4000 } as const;

function checkLengths(data: Partial<Record<keyof typeof limits, string>>, errors: EnquiryErrors) {
  for (const [field, max] of Object.entries(limits) as [keyof typeof limits, number][]) {
    if ((data[field]?.length ?? 0) > max && !errors[field]) errors[field] = `Keep this under ${max} characters.`;
  }
}

// What gets stored and emailed. Source "site" marks enquiries from the retired
// Next.js landing page (older rows); the website's form now sends "static".
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

// The enquiry API (used by the website's form, on Vercel and GitHub Pages). The
// form has one "email or phone" box, a "what do you need" menu and an optional
// message; API callers may also send separate email/phone fields.
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
