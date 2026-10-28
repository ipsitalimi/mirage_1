import { BagLineItem } from "@/components/bag/BagLineItem";
import { BagSummary } from "@/components/bag/BagSummary";
import { useCart } from "@/hooks/use-cart";
import { useFragrances } from "@/hooks/use-products";
import { lineTotal } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

/**
 * The bag. Cart lines are client-owned selections; the catalogue supplies the
 * product identity and the authoritative price for each chosen size. Lines
 * whose fragrance or size no longer exists are simply not rendered.
 */
export function BagPage() {
  const { lines, itemCount, setQuantity, removeLine } = useCart();
  const { data: fragrances, isLoading } = useFragrances();

  const catalogue = fragrances ?? [];

  const resolved = lines.flatMap((line) => {
    const fragrance = catalogue.find((entry) => entry.id === line.fragranceId);
    if (!fragrance) return [];
    const size = fragrance.sizes.find(
      (entry) => entry.sizeLabel === line.sizeLabel,
    );
    if (!size) return [];
    return [{ line, fragrance, unitPrice: size.price }];
  });

  const subtotal = resolved.reduce(
    (total, entry) => total + lineTotal(entry.unitPrice, entry.line.quantity),
    0n,
  );

  const isEmpty = lines.length === 0;

  return (
    <section
      data-ocid="bag.page"
      className="mx-auto w-full max-w-[1600px] px-5 pb-24 pt-32 md:px-10 md:pb-32 md:pt-40"
    >
      <header className="flex flex-col gap-4 border-b border-border/60 pb-10">
        <span className="text-label text-accent">Your selection</span>
        <h1 className="font-display text-5xl uppercase tracking-brand text-foreground md:text-7xl">
          Bag
        </h1>
        {!isEmpty && (
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {itemCount === 1
              ? "One composition held in reserve."
              : `${itemCount} compositions held in reserve.`}
          </p>
        )}
      </header>

      {isLoading && !isEmpty ? (
        <div
          data-ocid="bag.loading_state"
          className="mt-12 flex flex-col gap-4"
          aria-busy="true"
        >
          {Array.from({ length: 2 }, (_, i) => `bag-skeleton-${i}`).map(
            (id) => (
              <div
                key={id}
                className="h-40 w-full animate-pulse border border-border/40 bg-card/40"
              />
            ),
          )}
        </div>
      ) : isEmpty ? (
        <div
          data-ocid="bag.empty_state"
          className="mt-16 flex flex-col items-start gap-6 border border-border/60 bg-gradient-smoke p-10 md:p-16"
        >
          <span className="text-label text-accent">Nothing held</span>
          <h2 className="max-w-2xl font-display text-3xl uppercase tracking-brand text-foreground md:text-5xl">
            Your bag is empty
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            The house is quiet. Choose a fragrance to begin your selection.
          </p>
          <Link
            to="/"
            data-ocid="bag.empty_cta"
            className="group flex items-center gap-4 bg-gradient-primary px-6 py-4 text-label text-primary-foreground transition-smooth hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            Explore the collection
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-16">
          <ul data-ocid="bag.list" className="flex flex-col gap-5">
            {resolved.map((entry, index) => (
              <BagLineItem
                key={`${entry.line.fragranceId}-${entry.line.sizeLabel}`}
                fragrance={entry.fragrance}
                sizeLabel={entry.line.sizeLabel}
                quantity={entry.line.quantity}
                index={index + 1}
                onSetQuantity={(quantity) =>
                  setQuantity(
                    entry.line.fragranceId,
                    entry.line.sizeLabel,
                    quantity,
                  )
                }
                onRemove={() =>
                  removeLine(entry.line.fragranceId, entry.line.sizeLabel)
                }
              />
            ))}
          </ul>

          <BagSummary itemCount={itemCount} subtotal={subtotal} />
        </div>
      )}
    </section>
  );
}
