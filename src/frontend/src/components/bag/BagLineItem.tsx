import type { Fragrance } from "@/backend";
import { formatPrice, lineTotal } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { Minus, Plus, X } from "lucide-react";

interface BagLineItemProps {
  fragrance: Fragrance;
  sizeLabel: string;
  quantity: number;
  index: number;
  onSetQuantity: (quantity: number) => void;
  onRemove: () => void;
}

/**
 * One bag line: product identity, chosen size, quantity stepper and the
 * running line total. The unit price is resolved from the fragrance's own
 * size list so the bag never invents a price the catalogue does not carry.
 */
export function BagLineItem({
  fragrance,
  sizeLabel,
  quantity,
  index,
  onSetQuantity,
  onRemove,
}: BagLineItemProps) {
  const size = fragrance.sizes.find((entry) => entry.sizeLabel === sizeLabel);
  const unitPrice = size?.price ?? 0n;
  const total = lineTotal(unitPrice, quantity);

  return (
    <li
      data-ocid={`bag.item.${index}`}
      className="glass-surface grain-overlay relative grid grid-cols-[auto_1fr] gap-x-5 gap-y-4 p-5 md:grid-cols-[7rem_1fr_auto] md:items-center md:gap-x-8 md:p-6"
    >
      <div
        aria-hidden="true"
        className="flex h-24 w-20 items-center justify-center border border-border/60 bg-gradient-smoke md:h-28 md:w-28"
      >
        <span className="font-display text-2xl uppercase tracking-brand text-accent/70">
          {fragrance.name.slice(0, 2)}
        </span>
      </div>

      <div className="min-w-0">
        <span className="text-label text-muted-foreground">{sizeLabel}</span>
        <h3 className="mt-2 font-display text-xl uppercase tracking-brand text-foreground md:text-2xl">
          <Link
            to="/product/$fragranceId"
            params={{ fragranceId: fragrance.id.toString() }}
            data-ocid={`bag.item_link.${index}`}
            className="transition-smooth hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {fragrance.name}
          </Link>
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatPrice(unitPrice)} each
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center border border-border/70">
            <button
              type="button"
              data-ocid={`bag.decrement_button.${index}`}
              aria-label={`Decrease quantity of ${fragrance.name} ${sizeLabel}`}
              disabled={quantity <= 1}
              onClick={() => onSetQuantity(quantity - 1)}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-smooth hover:text-accent disabled:cursor-not-allowed disabled:text-muted-foreground/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Minus className="h-4 w-4" aria-hidden="true" />
            </button>
            <span
              data-ocid={`bag.quantity.${index}`}
              aria-live="polite"
              className="w-10 text-center font-mono text-sm text-foreground"
            >
              {quantity}
            </span>
            <button
              type="button"
              data-ocid={`bag.increment_button.${index}`}
              aria-label={`Increase quantity of ${fragrance.name} ${sizeLabel}`}
              onClick={() => onSetQuantity(quantity + 1)}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-smooth hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <button
            type="button"
            data-ocid={`bag.remove_button.${index}`}
            onClick={onRemove}
            className="flex items-center gap-2 text-label text-muted-foreground transition-smooth hover:text-destructive focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      </div>

      <div className="col-span-2 flex items-baseline justify-between border-t border-border/50 pt-4 md:col-span-1 md:block md:border-t-0 md:pt-0 md:text-right">
        <span className="text-label text-muted-foreground md:hidden">
          Line total
        </span>
        <span
          data-ocid={`bag.line_total.${index}`}
          className="font-display text-lg tracking-brand text-foreground md:text-xl"
        >
          {formatPrice(total)}
        </span>
      </div>
    </li>
  );
}
