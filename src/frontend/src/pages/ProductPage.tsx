import type { FragranceId } from "@/backend";
import { QuantityControl } from "@/components/product/QuantityControl";
import { SizeSelector } from "@/components/product/SizeSelector";
import { useCart } from "@/hooks/use-cart";
import { useFragrance } from "@/hooks/use-products";
import { formatPrice, lineTotal } from "@/lib/format";
import { PRODUCT_BOTTLE_IMAGE } from "@/lib/imageManifest";
import { Link, useParams } from "@tanstack/react-router";
import { Check, ShoppingBag } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

function parseFragranceId(raw: string): FragranceId | undefined {
  if (!/^\d+$/.test(raw)) return undefined;
  return BigInt(raw);
}

export function ProductPage() {
  const { fragranceId } = useParams({ from: "/product/$fragranceId" });
  const id = useMemo(() => parseFragranceId(fragranceId), [fragranceId]);
  const { data: fragrance, isLoading } = useFragrance(id);
  const { addLine } = useCart();

  const [selectedLabel, setSelectedLabel] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  // Default to the first size once the fragrance arrives, without clobbering
  // a choice the visitor has already made.
  useEffect(() => {
    if (!fragrance || fragrance.sizes.length === 0) return;
    setSelectedLabel((current) =>
      current && fragrance.sizes.some((s) => s.sizeLabel === current)
        ? current
        : fragrance.sizes[0].sizeLabel,
    );
  }, [fragrance]);

  // Confirmation is transient feedback, not persistent state.
  useEffect(() => {
    if (!confirmed) return;
    const timer = window.setTimeout(() => setConfirmed(false), 4000);
    return () => window.clearTimeout(timer);
  }, [confirmed]);

  const selectedSize = fragrance?.sizes.find(
    (size) => size.sizeLabel === selectedLabel,
  );

  const handleAdd = () => {
    if (!fragrance || !selectedSize) return;
    addLine({
      fragranceId: fragrance.id,
      sizeLabel: selectedSize.sizeLabel,
      quantity,
    });
    setConfirmed(true);
  };

  if (isLoading) {
    return (
      <section
        data-ocid="product.loading_state"
        className="mx-auto w-full max-w-[1600px] px-5 pb-32 pt-32 md:px-10 md:pt-40"
      >
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div className="aspect-[4/5] w-full animate-pulse bg-card/60" />
          <div className="flex flex-col gap-6">
            <div className="h-3 w-24 animate-pulse bg-card/60" />
            <div className="h-12 w-3/4 animate-pulse bg-card/60" />
            <div className="h-4 w-full animate-pulse bg-card/60" />
            <div className="h-4 w-5/6 animate-pulse bg-card/60" />
          </div>
        </div>
      </section>
    );
  }

  if (!fragrance) {
    return (
      <section
        data-ocid="product.empty_state"
        className="mx-auto flex min-h-[70vh] w-full max-w-[1600px] flex-col justify-center gap-6 px-5 py-32 md:px-10"
      >
        <span className="text-label text-accent">Not found</span>
        <h1 className="font-display text-4xl uppercase tracking-brand text-foreground md:text-6xl">
          This scent has vanished
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          The fragrance you are looking for is no longer in the house archive.
        </p>
        <Link
          to="/"
          data-ocid="product.back_link"
          className="text-label w-fit border-b border-accent pb-1 text-accent transition-smooth hover:text-foreground"
        >
          Return to the maison
        </Link>
      </section>
    );
  }

  return (
    <article
      data-ocid="product.page"
      className="mx-auto w-full max-w-[1600px] px-5 pb-32 pt-28 md:px-10 md:pt-40"
    >
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        {/* Imagery — asymmetric editorial frame with a smoky crimson wash. */}
        <div className="relative">
          <div className="grain-overlay relative aspect-[4/5] w-full overflow-hidden border border-border/70 bg-card">
            <img
              src={PRODUCT_BOTTLE_IMAGE}
              alt={`${fragrance.name} fragrance bottle`}
              className="h-full w-full object-cover"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-smoke" />
          </div>
          <span className="mt-4 block text-label text-muted-foreground">
            {fragrance.notes.length} accords · eau de parfum
          </span>
        </div>

        {/* Detail column */}
        <div className="flex min-w-0 flex-col gap-8 lg:pt-6">
          <div className="flex flex-col gap-4">
            <span className="text-label text-accent">Maison Mirage</span>
            <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-brand text-foreground md:text-6xl">
              {fragrance.name}
            </h1>
            <p className="font-display text-lg uppercase tracking-brand text-accent md:text-xl">
              {fragrance.tagline}
            </p>
          </div>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            {fragrance.description}
          </p>

          <div className="flex flex-col gap-3">
            <span className="text-label text-muted-foreground">Notes</span>
            <ul data-ocid="product.notes_list" className="flex flex-wrap gap-2">
              {fragrance.notes.map((note) => (
                <li
                  key={note}
                  className="border border-border/70 bg-card/40 px-3 py-1.5 font-mono text-xs uppercase tracking-wider text-muted-foreground"
                >
                  {note}
                </li>
              ))}
            </ul>
          </div>

          <div className="h-px w-full bg-border/70" />

          <SizeSelector
            sizes={fragrance.sizes}
            selectedLabel={selectedLabel ?? ""}
            onSelect={setSelectedLabel}
          />

          <QuantityControl value={quantity} onChange={setQuantity} />

          <div className="flex flex-col gap-5 border-t border-border/70 pt-6">
            <div className="flex items-baseline justify-between gap-4">
              <span className="text-label text-muted-foreground">Total</span>
              <span
                data-ocid="product.total_price"
                className="font-display text-2xl uppercase tracking-brand text-foreground md:text-3xl"
              >
                {selectedSize
                  ? formatPrice(lineTotal(selectedSize.price, quantity))
                  : "—"}
              </span>
            </div>

            <button
              type="button"
              data-ocid="product.add_to_bag_button"
              disabled={!selectedSize}
              onClick={handleAdd}
              className="group flex h-14 w-full items-center justify-center gap-3 bg-primary px-8 font-display text-sm uppercase tracking-brand text-primary-foreground transition-smooth hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              Add to bag
            </button>

            {confirmed && (
              <output
                data-ocid="product.success_state"
                className="flex items-center gap-2 text-sm text-accent"
              >
                <Check className="h-4 w-4" aria-hidden="true" />
                Added to your bag — {quantity} × {selectedSize?.sizeLabel ?? ""}
              </output>
            )}

            <Link
              to="/bag"
              data-ocid="product.view_bag_link"
              className="text-label w-fit text-muted-foreground transition-smooth hover:text-accent"
            >
              View bag
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
