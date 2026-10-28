import { formatPrice } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

interface BagSummaryProps {
  itemCount: number;
  subtotal: bigint;
}

/**
 * The bag's running total and the single route into the demo checkout.
 * Kept as its own surface so the total reads as a deliberate editorial
 * statement rather than a line item buried under the list.
 */
export function BagSummary({ itemCount, subtotal }: BagSummaryProps) {
  return (
    <aside
      data-ocid="bag.summary"
      className="glass-surface grain-overlay crimson-glow flex flex-col gap-6 p-6 md:p-8 lg:sticky lg:top-28"
    >
      <div>
        <span className="text-label text-accent">Summary</span>
        <h2 className="mt-3 font-display text-2xl uppercase tracking-brand text-foreground md:text-3xl">
          Your selection
        </h2>
      </div>

      <dl className="flex flex-col gap-3 border-y border-border/60 py-5">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-muted-foreground">
            {itemCount === 1 ? "1 item" : `${itemCount} items`}
          </dt>
          <dd
            data-ocid="bag.subtotal"
            className="font-mono text-sm text-foreground"
          >
            {formatPrice(subtotal)}
          </dd>
        </div>
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-muted-foreground">Delivery</dt>
          <dd className="font-mono text-sm text-muted-foreground">
            Calculated at checkout
          </dd>
        </div>
      </dl>

      <div className="flex items-baseline justify-between gap-4">
        <span className="text-label text-muted-foreground">Total</span>
        <span
          data-ocid="bag.total"
          className="font-display text-3xl tracking-brand text-foreground md:text-4xl"
        >
          {formatPrice(subtotal)}
        </span>
      </div>

      <Link
        to="/checkout"
        data-ocid="bag.checkout_button"
        className="group flex items-center justify-between gap-4 bg-gradient-primary px-6 py-4 text-label text-primary-foreground transition-smooth hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Proceed to checkout
        <ArrowRight
          className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          aria-hidden="true"
        />
      </Link>

      <Link
        to="/"
        data-ocid="bag.continue_link"
        className="text-center text-label text-muted-foreground transition-smooth hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Continue exploring
      </Link>
    </aside>
  );
}
