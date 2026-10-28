import type { FragranceId } from "@/backend";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Client-owned bag state. The bag is not backend data — it is the visitor's
 * in-progress selection — so it lives in React state and is mirrored to
 * localStorage so it survives navigation and a browser refresh.
 */

export interface CartLine {
  fragranceId: FragranceId;
  sizeLabel: string;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  itemCount: number;
  addLine: (line: CartLine) => void;
  setQuantity: (
    fragranceId: FragranceId,
    sizeLabel: string,
    quantity: number,
  ) => void;
  removeLine: (fragranceId: FragranceId, sizeLabel: string) => void;
  clear: () => void;
}

const STORAGE_KEY = "mirage.bag.v1";

const CartContext = createContext<CartContextValue | null>(null);

function sameLine(
  a: CartLine,
  fragranceId: FragranceId,
  sizeLabel: string,
): boolean {
  return a.fragranceId === fragranceId && a.sizeLabel === sizeLabel;
}

function readStoredLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry): CartLine[] => {
      if (typeof entry !== "object" || entry === null) return [];
      const record = entry as Record<string, unknown>;
      const id = record.fragranceId;
      const sizeLabel = record.sizeLabel;
      const quantity = record.quantity;
      if (
        (typeof id !== "string" && typeof id !== "number") ||
        typeof sizeLabel !== "string" ||
        typeof quantity !== "number" ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        return [];
      }
      return [
        { fragranceId: BigInt(id), sizeLabel, quantity: Math.trunc(quantity) },
      ];
    });
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(readStoredLines);

  useEffect(() => {
    try {
      const serializable = lines.map((line) => ({
        fragranceId: line.fragranceId.toString(),
        sizeLabel: line.sizeLabel,
        quantity: line.quantity,
      }));
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
    } catch {
      // Storage can be unavailable (private mode); the in-memory bag still works.
    }
  }, [lines]);

  const addLine = useCallback((line: CartLine) => {
    setLines((current) => {
      const existing = current.find((entry) =>
        sameLine(entry, line.fragranceId, line.sizeLabel),
      );
      if (existing) {
        return current.map((entry) =>
          sameLine(entry, line.fragranceId, line.sizeLabel)
            ? { ...entry, quantity: entry.quantity + line.quantity }
            : entry,
        );
      }
      return [...current, line];
    });
  }, []);

  const setQuantity = useCallback(
    (fragranceId: FragranceId, sizeLabel: string, quantity: number) => {
      const next = Math.trunc(quantity);
      setLines((current) => {
        if (next <= 0) {
          return current.filter(
            (entry) => !sameLine(entry, fragranceId, sizeLabel),
          );
        }
        return current.map((entry) =>
          sameLine(entry, fragranceId, sizeLabel)
            ? { ...entry, quantity: next }
            : entry,
        );
      });
    },
    [],
  );

  const removeLine = useCallback(
    (fragranceId: FragranceId, sizeLabel: string) => {
      setLines((current) =>
        current.filter((entry) => !sameLine(entry, fragranceId, sizeLabel)),
      );
    },
    [],
  );

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = lines.reduce((total, line) => total + line.quantity, 0);
    return { lines, itemCount, addLine, setQuantity, removeLine, clear };
  }, [lines, addLine, setQuantity, removeLine, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
