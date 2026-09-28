import nodemailer, { type Transporter } from "nodemailer";
import { isEmail, type Enquiry } from "@/lib/enquiry";
import { markets } from "@/lib/site";

// Sends enquiries through Gmail's SMTP server with an app password
// (Google Account > Security > 2-Step Verification > App passwords).
// Configure in .env.local; see .env.example.
//
// ENQUIRY_DELIVERY=log skips sending and prints the enquiry instead. The test
// suite uses it so it never sends real mail.

export type Delivery = "sent" | "logged" | "not-configured";

let transport: Transporter | null = null;

function getTransport(user: string, pass: string) {
  transport ??= nodemailer.createTransport({ service: "gmail", auth: { user, pass } });
  return transport;
}

// Header values come from the visitor, so strip line breaks before they reach
// the subject line.
const oneLine = (s: string) => s.replace(/[\r\n]+/g, " ").trim();

const sources = { site: "Main website", static: "Static site" } as const;

export async function deliverEnquiry(enquiry: Enquiry, id?: number): Promise<Delivery> {
  if (process.env.ENQUIRY_DELIVERY === "log") {
    console.info("Enquiry (not sent, ENQUIRY_DELIVERY=log)", { id, ...enquiry });
    return "logged";
  }

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (!user || !pass) {
    console.error("Enquiry not emailed: set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local", { id, ...enquiry });
    return "not-configured";
  }

  const market = markets[enquiry.market];
  const lines = [
    `Name: ${enquiry.name}`,
    `Business: ${enquiry.business}`,
    `Email: ${enquiry.email || "not given"}`,
    `Phone or WhatsApp: ${enquiry.phone || "not given"}`,
    `Market: ${market.label} (quote in ${market.currency})`,
    ...(enquiry.need ? [`Needs: ${enquiry.need}`] : []),
    `Sent from: ${sources[enquiry.source]}${id ? ` (enquiry #${id})` : ""}`,
    "",
    "Message:",
    enquiry.message || "(none)",
  ];

  await getTransport(user, pass).sendMail({
    from: { name: "Digital Pragati website", address: user },
    to: process.env.ENQUIRY_TO || user,
    ...(isEmail(enquiry.email) && { replyTo: { name: oneLine(enquiry.name), address: oneLine(enquiry.email) } }),
    subject: oneLine(`New enquiry: ${enquiry.business} (${market.label})`),
    text: lines.join("\n"),
  });
  return "sent";
}
