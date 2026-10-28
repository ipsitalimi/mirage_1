import type { Size } from "@/backend";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SizeSelectorProps {
  sizes: Size[];
  selectedLabel: string;
  onSelect: (sizeLabel: string) => void;
}

/** Turn a size label such as "50 ML" into a valid ocid segment ("50ml"). */
function sizeSlug(sizeLabel: string): string {
  return sizeLabel.toLowerCase().replace(/[^a-z0-9]+/g, "");
}

/**
 * Selectable fragrance sizes. Each option carries its own price so the
 * visitor reads the cost of the exact volume before committing to the bag.
 */
export function SizeSelector({
  sizes,
  selectedLabel,
  onSelect,
}: SizeSelectorProps) {
  return (
    <fieldset data-ocid="product.size_selector" className="min-w-0">
      <legend className="text-label text-muted-foreground">Volume</legend>
      <div className="mt-4 flex flex-wrap gap-3">
        {sizes.map((size) => {
          const selected = size.sizeLabel === selectedLabel;
          return (
            <button
              key={size.sizeLabel}
              type="button"
              data-ocid={`product.size_option.${sizeSlug(size.sizeLabel)}`}
              aria-pressed={selected}
              onClick={() => onSelect(size.sizeLabel)}
              className={cn(
                "group flex min-w-[7.5rem] flex-col items-start gap-1 border px-4 py-3 text-left transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected
                  ? "border-accent bg-accent/10 text-foreground"
                  : "border-border bg-card/40 text-muted-foreground hover:border-accent/60 hover:text-foreground",
              )}
            >
              <span className="font-display text-sm uppercase tracking-brand">
                {size.sizeLabel}
              </span>
              <span
                className={cn(
                  "font-mono text-xs",
                  selected ? "text-accent" : "text-muted-foreground",
                )}
              >
                {formatPrice(size.price)}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
