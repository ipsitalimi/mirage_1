import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Maison" },
  { to: "/collage", label: "Editorial" },
] as const;

export function Header() {
  const { itemCount } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      data-ocid="site.header"
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-smooth",
        scrolled
          ? "border-border/70 bg-background/80 backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between gap-4 px-5 md:h-20 md:px-10">
        <Link
          to="/"
          data-ocid="nav.brand_link"
          className="font-display text-xl uppercase tracking-brand text-foreground transition-smooth hover:text-accent md:text-2xl"
          onClick={() => setMenuOpen(false)}
        >
          Mirage
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-10 md:flex"
          data-ocid="nav.primary"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              data-ocid={`nav.link.${link.label.toLowerCase()}`}
              className="text-label text-muted-foreground transition-smooth hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to="/bag"
            data-ocid="nav.bag_link"
            aria-label={`Shopping bag, ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
            className="relative flex h-11 w-11 items-center justify-center rounded-sm text-foreground transition-smooth hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            {itemCount > 0 && (
              <span
                data-ocid="nav.bag_count"
                className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 font-mono text-[0.625rem] leading-none text-primary-foreground"
              >
                {itemCount}
              </span>
            )}
          </Link>

          <button
            type="button"
            data-ocid="nav.menu_toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="flex h-11 w-11 items-center justify-center rounded-sm text-foreground transition-smooth hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="Mobile"
          data-ocid="nav.mobile_menu"
          className="border-t border-border/70 bg-background/95 backdrop-blur-xl md:hidden"
        >
          <ul className="mx-auto flex w-full max-w-[1600px] flex-col px-5 py-4">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.to}
                  data-ocid={`nav.mobile_link.${link.label.toLowerCase()}`}
                  className="block py-3 font-display text-2xl uppercase tracking-brand text-foreground transition-smooth hover:text-accent"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
