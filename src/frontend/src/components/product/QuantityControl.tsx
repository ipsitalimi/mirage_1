import { Minus, Plus } from "lucide-react";

interface QuantityControlProps {
  value: number;
  onChange: (quantity: number) => void;
  min?: number;
  max?: number;
}

/**
 * Stepper for the number of units added to the bag. The value is clamped to
 * the supplied bounds so the control can never emit an invalid quantity.
 */
export function QuantityControl({
  value,
  onChange,
  min = 1,
  max = 9,
}: QuantityControlProps) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(Math.min(max, value + 1));

  return (
    <div className="min-w-0">
      <span className="text-label text-muted-foreground">Quantity</span>
      <div
        data-ocid="product.quantity_control"
        className="mt-4 inline-flex items-center border border-border bg-card/40"
      >
        <button
          type="button"
          data-ocid="product.quantity_decrease"
          aria-label="Decrease quantity"
          disabled={value <= min}
          onClick={decrease}
          className="flex h-11 w-11 items-center justify-center text-foreground transition-smooth hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:text-muted-foreground/50"
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span
          data-ocid="product.quantity_value"
          aria-live="polite"
          className="w-12 text-center font-mono text-sm text-foreground"
        >
          {value}
        </span>
        <button
          type="button"
          data-ocid="product.quantity_increase"
          aria-label="Increase quantity"
          disabled={value >= max}
          onClick={increase}
          className="flex h-11 w-11 items-center justify-center text-foreground transition-smooth hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:text-muted-foreground/50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
