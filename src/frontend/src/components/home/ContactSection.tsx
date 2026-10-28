import { useState } from "react";

const CONTACT_DETAILS = [
  { label: "Atelier", value: "14 Rue de la Nuit, 75004 Paris" },
  {
    label: "Email",
    value: "atelier@mirage.com",
    href: "mailto:atelier@mirage.com",
  },
  { label: "Telephone", value: "+33 1 84 00 00 00", href: "tel:+33184000000" },
  { label: "Hours", value: "Tue – Sat · 11:00 – 19:00" },
];

/**
 * Contact section — the house's details alongside a message form. The form is
 * a local draft with a visible confirmation; no backend endpoint is required.
 */
export function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const canSubmit =
    name.trim().length > 0 &&
    email.trim().length > 0 &&
    message.trim().length > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setName("");
    setEmail("");
    setMessage("");
    setSent(true);
  }

  return (
    <section
      data-ocid="home.contact_section"
      aria-label="Contact the house"
      className="relative w-full border-t border-border/50 px-5 py-24 md:px-10 md:py-40"
    >
      <div className="mx-auto grid w-full max-w-[1600px] gap-16 md:grid-cols-2 md:gap-24">
        <div className="flex flex-col gap-8">
          <span className="text-label text-accent">Contact</span>
          <h2 className="font-display text-4xl uppercase leading-[0.95] tracking-brand text-foreground md:text-6xl">
            Speak to
            <br />
            the house
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
            For private consultations, press enquiries or a scent composed for
            you alone, write to the atelier.
          </p>

          <dl className="mt-4 flex flex-col gap-5">
            {CONTACT_DETAILS.map((detail) => (
              <div
                key={detail.label}
                className="flex flex-col gap-1 border-t border-border/50 pt-4"
              >
                <dt className="text-label text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="text-sm text-foreground/90">
                  {detail.href ? (
                    <a
                      href={detail.href}
                      data-ocid={`home.contact.${detail.label.toLowerCase()}_link`}
                      className="transition-smooth hover:text-accent"
                    >
                      {detail.value}
                    </a>
                  ) : (
                    detail.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <form
          data-ocid="home.contact_form"
          onSubmit={handleSubmit}
          className="glass-surface flex flex-col gap-6 p-6 md:p-10"
        >
          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-name"
              className="text-label text-muted-foreground"
            >
              Name
            </label>
            <input
              id="contact-name"
              data-ocid="home.contact.name_input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
              className="border-b border-input bg-transparent py-3 text-sm text-foreground outline-none transition-smooth focus-visible:border-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-email"
              className="text-label text-muted-foreground"
            >
              Email
            </label>
            <input
              id="contact-email"
              data-ocid="home.contact.email_input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="border-b border-input bg-transparent py-3 text-sm text-foreground outline-none transition-smooth focus-visible:border-accent"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="contact-message"
              className="text-label text-muted-foreground"
            >
              Message
            </label>
            <textarea
              id="contact-message"
              data-ocid="home.contact.message_textarea"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
              className="resize-none border-b border-input bg-transparent py-3 text-sm text-foreground outline-none transition-smooth focus-visible:border-accent"
            />
          </div>

          <button
            type="submit"
            data-ocid="home.contact.submit_button"
            disabled={!canSubmit}
            className="mt-2 w-fit bg-primary px-8 py-3 text-label text-primary-foreground transition-smooth hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Send message
          </button>

          {sent && (
            <output
              data-ocid="home.contact.success_state"
              className="text-sm text-accent"
            >
              Thank you — the atelier will reply within two working days.
            </output>
          )}
        </form>
      </div>
    </section>
  );
}
