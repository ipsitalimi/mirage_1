import type { Fragrance } from "@/backend";
import { EditorialCollage } from "@/components/home/EditorialCollage";
import { FragrancePanels } from "@/components/home/FragrancePanels";
import { CartProvider } from "@/hooks/use-cart";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRouter,
} from "@tanstack/react-router";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithActor } from "./test-utils";

const CATALOGUE: Fragrance[] = [
  {
    id: 1n,
    name: "NOCTURNE",
    tagline: "A wound that never closes.",
    description: "Smoke over cold stone.",
    notes: ["Black Plum", "Incense"],
    sizes: [
      { sizeLabel: "30 ML", price: 180n },
      { sizeLabel: "50 ML", price: 260n },
    ],
  },
  {
    id: 2n,
    name: "VESPER",
    tagline: "The hour after the last light.",
    description: "An amber that behaves like a memory.",
    notes: ["Amber", "Sea Salt"],
    sizes: [{ sizeLabel: "50 ML", price: 285n }],
  },
];

function makeActor() {
  return {
    listFragrances: vi.fn<() => Promise<Fragrance[]>>(async () =>
      structuredClone(CATALOGUE),
    ),
    getFragrance: vi.fn<(id: bigint) => Promise<Fragrance | null>>(async (id) =>
      structuredClone(CATALOGUE.find((entry) => entry.id === id) ?? null),
    ),
  };
}

beforeEach(() => {
  window.localStorage.clear();
});

// This file exists on its own because motion caches the reduced-motion
// preference on first read; the override must be installed before any render.
describe("reduced motion", () => {
  it("renders fragrance panels and the collage in their final state", async () => {
    const actor = makeActor();
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    try {
      const rootRoute = createRootRoute({
        component: () => (
          <CartProvider>
            <FragrancePanels />
            <EditorialCollage />
          </CartProvider>
        ),
      });
      const router = createRouter({
        routeTree: rootRoute,
        history: createMemoryHistory({ initialEntries: ["/"] }),
        defaultPendingMinMs: 0,
      });
      renderWithActor(<RouterProvider router={router} />, actor);

      const panel = await screen.findByTestId("home.fragrance_panel.1");
      // With reduced motion the panel mounts with no initial transform/opacity.
      expect(panel.style.transform).toBe("");
      expect(panel.style.opacity).toBe("");

      const section = screen.getByTestId("home.editorial_section");
      // No clip mask is applied when reduced motion is preferred.
      const masked = section.querySelectorAll('[style*="clip-path"]');
      expect(masked.length).toBe(0);
    } finally {
      window.matchMedia = original;
    }
  });
});
