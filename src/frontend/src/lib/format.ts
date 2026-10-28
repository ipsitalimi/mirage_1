/**
 * Shared currency formatting for the MIRAGE catalogue.
 *
 * Backend prices are whole currency units carried as `bigint` (no minor
 * units, no decimals). Every price surface — product, bag and checkout —
 * formats through here so the house never shows two different renderings of
 * the same amount.
 */

const CURRENCY = "EUR";
const LOCALE = "en-IE";

const formatter = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a whole-currency-unit price as a display currency string. */
export function formatPrice(units: bigint): string {
  const amount = Number(units);
  if (!Number.isFinite(amount)) return formatter.format(0);
  return formatter.format(amount);
}

/** Multiply a unit price by a quantity, staying in whole currency units. */
export function lineTotal(unitPrice: bigint, quantity: number): bigint {
  return unitPrice * BigInt(Math.max(0, Math.trunc(quantity)));
}
