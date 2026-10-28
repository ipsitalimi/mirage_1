import type { LineItem, Order } from "@/backend";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/hooks/use-cart";
import { useFragrances } from "@/hooks/use-products";
import { formatPrice, lineTotal } from "@/lib/format";

interface ResolvedLine {
  key: string;
  name: string;
  sizeLabel: string;
  quantity: number;
  unitPrice: bigint;
  total: bigint;
}

/**
 * Resolve the client bag against the catalogue so the summary shows real
 * names and prices. Lines whose fragrance is no longer in the catalogue are
 * dropped rather than rendered with a fabricated price.
 */
function useResolvedBag(): {
  lines: ResolvedLine[];
  total: bigint;
  isLoading: boolean;
} {
  const { lines } = useCart();
  const { data: fragrances, isLoading } = useFragrances();

  const resolved: ResolvedLine[] = [];
  let total = 0n;

  for (const line of lines) {
    const fragrance = fragrances?.find(
      (entry) => entry.id === line.fragranceId,
    );
    if (!fragrance) continue;
    const size = fragrance.sizes.find(
      (entry) => entry.sizeLabel === line.sizeLabel,
    );
    if (!size) continue;
    const lineSum = lineTotal(size.price, line.quantity);
    total += lineSum;
    resolved.push({
      key: `${line.fragranceId.toString()}-${line.sizeLabel}`,
      name: fragrance.name,
      sizeLabel: line.sizeLabel,
      quantity: line.quantity,
      unitPrice: size.price,
      total: lineSum,
    });
  }

  return { lines: resolved, total, isLoading };
}

function SummaryRow({ line }: { line: ResolvedLine }) {
  return (
    <li
      data-ocid={`checkout.summary.item.${line.key}`}
      className="flex items-start justify-between gap-4 border-b border-border/60 py-4 last:border-b-0"
    >
      <div className="min-w-0">
        <p className="truncate font-display text-sm uppercase tracking-brand text-foreground">
          {line.name}
        </p>
        <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
          {line.sizeLabel} · Qty {line.quantity}
        </p>
      </div>
      <span className="shrink-0 font-mono text-sm text-foreground">
        {formatPrice(line.total)}
      </span>
    </li>
  );
}

function SummaryShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-ocid="checkout.summary"
      className="glass-surface crimson-glow flex flex-col gap-6 rounded-sm p-6 md:p-8"
    >
      {children}
    </div>
  );
}

/** Editable bag summary shown beside the delivery form. */
export function OrderSummary() {
  const { lines, total, isLoading } = useResolvedBag();

  if (isLoading) {
    return (
      <SummaryShell>
        <Skeleton className="h-4 w-32" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }, (_, i) => `summary-skeleton-${i}`).map(
            (id) => (
              <Skeleton key={id} className="h-12 w-full" />
            ),
          )}
        </div>
      </SummaryShell>
    );
  }

  return (
    <SummaryShell>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg uppercase tracking-brand text-foreground">
          Order summary
        </h2>
        <span className="text-label text-accent">
          {lines.length} {lines.length === 1 ? "line" : "lines"}
        </span>
      </div>

      {lines.length === 0 ? (
        <p
          data-ocid="checkout.summary.empty_state"
          className="py-6 text-sm leading-relaxed text-muted-foreground"
        >
          Your bag is empty. Add a fragrance before placing an order.
        </p>
      ) : (
        <ul data-ocid="checkout.summary.list" className="flex flex-col">
          {lines.map((line) => (
            <SummaryRow key={line.key} line={line} />
          ))}
        </ul>
      )}

      <div className="flex items-baseline justify-between gap-4 border-t border-border pt-5">
        <span className="text-label text-muted-foreground">Total</span>
        <span
          data-ocid="checkout.summary.total"
          className="font-display text-2xl uppercase tracking-brand text-foreground"
        >
          {formatPrice(total)}
        </span>
      </div>
    </SummaryShell>
  );
}

/** Read-only summary of a placed order, shown on the confirmation. */
export function OrderConfirmationSummary({ order }: { order: Order }) {
  const items: LineItem[] = order.items;
  return (
    <SummaryShell>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg uppercase tracking-brand text-foreground">
          Order summary
        </h2>
        <span
          data-ocid="checkout.confirmation.order_id"
          className="font-mono text-[0.6875rem] uppercase tracking-wider text-accent"
        >
          No. {order.id.toString().padStart(5, "0")}
        </span>
      </div>

      <ul data-ocid="checkout.confirmation.list" className="flex flex-col">
        {items.map((item) => (
          <li
            key={`${item.fragranceId.toString()}-${item.sizeLabel}`}
            className="flex items-start justify-between gap-4 border-b border-border/60 py-4 last:border-b-0"
          >
            <div className="min-w-0">
              <p className="truncate font-display text-sm uppercase tracking-brand text-foreground">
                {item.sizeLabel}
              </p>
              <p className="mt-1 font-mono text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                Qty {item.quantity.toString()}
              </p>
            </div>
            <span className="shrink-0 font-mono text-sm text-foreground">
              {formatPrice(item.lineTotal)}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-baseline justify-between gap-4 border-t border-border pt-5">
        <span className="text-label text-muted-foreground">Total</span>
        <span
          data-ocid="checkout.confirmation.total"
          className="font-display text-2xl uppercase tracking-brand text-foreground"
        >
          {formatPrice(order.total)}
        </span>
      </div>

      <dl className="grid grid-cols-1 gap-3 border-t border-border pt-5 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="text-label text-muted-foreground">Deliver to</dt>
          <dd className="mt-1 break-words text-foreground">
            {order.delivery.fullName}
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-label text-muted-foreground">Email</dt>
          <dd className="mt-1 break-words text-foreground">
            {order.delivery.email}
          </dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="text-label text-muted-foreground">Address</dt>
          <dd className="mt-1 break-words text-foreground">
            {order.delivery.address}, {order.delivery.city}{" "}
            {order.delivery.postalCode}, {order.delivery.country}
          </dd>
        </div>
      </dl>
    </SummaryShell>
  );
}
