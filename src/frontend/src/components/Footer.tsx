import { Link } from "@tanstack/react-router";

const FOOTER_LINKS = [
  { to: "/", label: "Maison" },
  {
    to: "/product/$fragranceId",
    label: "Shop",
    params: { fragranceId: "1" },
  },
  { to: "/bag", label: "Bag" },
  { to: "/checkout", label: "Checkout" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      data-ocid="site.footer"
      className="border-t border-border/70 bg-card/60"
    >
      <div className="mx-auto grid w-full max-w-[1600px] gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10 md:py-24">
        <div className="flex flex-col gap-4">
          <span className="font-display text-3xl uppercase tracking-brand text-foreground md:text-4xl">
            Mirage
          </span>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            A nocturnal house of scent. Composed in shadow, worn in light.
          </p>
        </div>

        <nav
          aria-label="Footer"
          data-ocid="footer.nav"
          className="flex flex-col gap-3"
        >
          <span className="text-label text-muted-foreground">Navigate</span>
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              params={"params" in link ? link.params : undefined}
              data-ocid={`footer.link.${link.label.toLowerCase()}`}
              className="w-fit text-sm text-foreground/80 transition-smooth hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <span className="text-label text-muted-foreground">Contact</span>
          <a
            href="mailto:atelier@mirage.com"
            data-ocid="footer.contact_link"
            className="w-fit text-sm text-foreground/80 transition-smooth hover:text-accent"
          >
            atelier@mirage.com
          </a>
          <span className="text-sm text-muted-foreground">
            Paris · 48.8566° N
          </span>
        </div>
      </div>

      <div className="border-t border-border/50">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-2 px-5 py-6 text-label text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
          <span>© {year} Mirage Parfums</span>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
              typeof window === "undefined" ? "" : window.location.hostname,
            )}`}
            target="_blank"
            rel="noreferrer"
            data-ocid="footer.attribution_link"
            className="transition-smooth hover:text-accent"
          >
            © {year}. Built with love using caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
