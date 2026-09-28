"use client";

import { useRef, useState, useTransition } from "react";
import { submitEnquiry } from "@/app/actions";
import { validateEnquiry, type EnquiryErrors, type EnquiryField } from "@/lib/enquiry";
import { markets, type Market } from "@/lib/site";

const fields: { id: EnquiryField; label: string; type?: string; autoComplete?: string; optional?: boolean }[] = [
  { id: "name", label: "Your name", autoComplete: "name" },
  { id: "business", label: "Business name", autoComplete: "organization" },
  { id: "email", label: "Email", type: "email", autoComplete: "email" },
  { id: "phone", label: "Phone or WhatsApp", type: "tel", autoComplete: "tel", optional: true },
];

export function EnquiryForm() {
  const [market, setMarket] = useState<Market>("au");
  const [errors, setErrors] = useState<EnquiryErrors>({});
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const m = markets[market];

  function focusFirstError(errs: EnquiryErrors) {
    const order: EnquiryField[] = ["name", "business", "email", "phone", "message"];
    const first = order.find((f) => errs[f]);
    if (first) formRef.current?.querySelector<HTMLElement>(`#f-${first}`)?.focus();
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = Object.fromEntries(
      (["name", "business", "email", "phone", "message"] as const).map((k) => [k, String(fd.get(k) ?? "")]),
    ) as Record<EnquiryField, string>;
    const errs = validateEnquiry(data);
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return focusFirstError(errs);

    startTransition(async () => {
      const result = await submitEnquiry(fd);
      if (result.ok) setSent(true);
      else {
        setErrors(result.errors);
        setFormError(result.formError ?? null);
        focusFirstError(result.errors);
      }
    });
  }

  if (sent) {
    return (
      <div className="form-sent" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
        <svg className="tick" viewBox="0 0 48 48" aria-hidden="true">
          <circle cx="24" cy="24" r="22" />
          <path d="M14 25l7 7 13-15" />
        </svg>
        <h3>Enquiry sent</h3>
        <p>
          Thanks. We reply within one business day, Sydney or Kathmandu time, to book your free strategy call.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} className="form" onSubmit={onSubmit} noValidate>
      <fieldset className="market-switch">
        <legend>Where is your business?</legend>
        {(Object.keys(markets) as Market[]).map((key) => (
          <label key={key} className="market-option">
            <input
              type="radio"
              name="market"
              value={key}
              checked={market === key}
              onChange={() => setMarket(key)}
            />
            <span>{markets[key].label}</span>
          </label>
        ))}
      </fieldset>
      <p className="market-note" aria-live="polite" data-currency={m.currency}>
        Quoted in {m.currency}. Pay by {m.payments.join(", ")}.
      </p>

      {fields.map((f) => (
        <div key={f.id} className="field">
          <label htmlFor={`f-${f.id}`}>
            {f.label}
            {f.optional && <span className="optional"> (optional)</span>}
          </label>
          <input
            id={`f-${f.id}`}
            name={f.id}
            type={f.type ?? "text"}
            autoComplete={f.autoComplete}
            aria-invalid={errors[f.id] ? true : undefined}
            aria-describedby={errors[f.id] ? `e-${f.id}` : undefined}
          />
          {errors[f.id] && (
            <p id={`e-${f.id}`} className="field-error">
              {errors[f.id]}
            </p>
          )}
        </div>
      ))}

      <div className="field">
        <label htmlFor="f-message">What do you want the website to do?</label>
        <textarea
          id="f-message"
          name="message"
          rows={4}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={errors.message ? "e-message" : undefined}
        />
        {errors.message && (
          <p id="e-message" className="field-error">
            {errors.message}
          </p>
        )}
      </div>

      {/* Honeypot: hidden from people, screen readers and the tab order; bots fill it in. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-website">Leave this empty</label>
        <input id="f-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {formError && (
        <p className="form-error" role="alert">
          {formError}
        </p>
      )}

      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Sending" : "Send enquiry"}
      </button>
    </form>
  );
}
