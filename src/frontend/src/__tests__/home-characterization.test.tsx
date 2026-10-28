import type { Fragrance } from "@/backend";
import { Layout } from "@/components/Layout";
import { FragrancePanels } from "@/components/home/FragrancePanels";
import { HeroCampaign } from "@/components/home/HeroCampaign";
import { CartProvider } from "@/hooks/use-cart";
import { CollagePage } from "@/pages/CollagePage";
import { HomePage } from "@/pages/HomePage";
import { ProductPage } from "@/pages/ProductPage";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  {
    id: 5n,
    name: "OBSIDIAN",
    tagline: "Black glass, held to the light.",
    description: "The house signature, stripped to its bones.",
    notes: ["Black Pepper", "Vetiver", "Mineral Accord"],
    sizes: [{ sizeLabel: "50 ML", price: 340n }],
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

/** A router mirroring App.tsx, wrapped in the real site shell. */
function renderApp(actor: ReturnType<typeof makeActor>, initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <CartProvider>
        <Layout>
          <Outlet />
        </Layout>
      </CartProvider>
    ),
  });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
  });
  const collageRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/collage",
    component: CollagePage,
  });
  const productRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/product/$fragranceId",
    component: ProductPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, collageRoute, productRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultPendingMinMs: 0,
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("homepage hero campaign", () => {
  it("renders the supplied MIRAGE campaign artwork without a blank screen", async () => {
    const actor = makeActor();
    renderApp(actor, "/");

    const hero = await screen.findByTestId("home.hero_section");
    const image = within(hero).getByRole("img");
    // The mobile hero now uses the portrait campaign image from the manifest.
    expect(image).toHaveAttribute(
      "src",
      "/images/mirage/hero-mobile-portrait.png",
    );
    expect(image).toHaveAttribute("loading", "eager");
    // The landscape source is the responsive crop at md and above.
    expect(
      hero.querySelector('source[media="(min-width: 768px)"]'),
    ).toHaveAttribute("srcset", "/assets/images/mirage-landscape.png");
    // The portrait hero keeps its bottom fade into black.
    expect(hero.querySelector(".from-background")).not.toBeNull();
    // No text is overlaid on the artwork.
    expect(within(hero).queryByRole("heading")).not.toBeInTheDocument();
  });
});

describe("fragrance panels", () => {
  it("renders one panel per catalogue fragrance with its name, tagline and notes", async () => {
    const actor = makeActor();
    renderApp(actor, "/");

    const section = await screen.findByTestId("home.fragrance_panels_section");
    expect(actor.listFragrances).toHaveBeenCalled();

    const first = await within(section).findByTestId("home.fragrance_panel.1");
    expect(
      within(first).getByRole("heading", { name: "NOCTURNE" }),
    ).toBeInTheDocument();
    expect(
      within(first).getByText("A wound that never closes."),
    ).toBeInTheDocument();
    expect(
      within(first).getByText(/Black Plum \/ Incense/),
    ).toBeInTheDocument();

    const second = within(section).getByTestId("home.fragrance_panel.2");
    expect(
      within(second).getByRole("heading", { name: "VESPER" }),
    ).toBeInTheDocument();
    expect(
      within(second).getByText("The hour after the last light."),
    ).toBeInTheDocument();
  });

  it("keeps the alternating left/right composition across panels at every width", async () => {
    const actor = makeActor();
    renderApp(actor, "/");

    const section = await screen.findByTestId("home.fragrance_panels_section");
    const first = await within(section).findByTestId("home.fragrance_panel.1");
    const second = within(section).getByTestId("home.fragrance_panel.2");

    // Even index aligns to the start, odd index to the end with right-aligned
    // text — the base classes apply on phones, the md: variants on desktop.
    expect(first.querySelector(".items-start")).not.toBeNull();
    expect(first.querySelector(".md\\:items-start")).not.toBeNull();
    expect(second.querySelector(".items-end")).not.toBeNull();
    expect(second.querySelector(".text-right")).not.toBeNull();
    expect(second.querySelector(".md\\:items-end")).not.toBeNull();
    expect(second.querySelector(".md\\:text-right")).not.toBeNull();
  });

  it("links each panel into its product page", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/");

    const section = await screen.findByTestId("home.fragrance_panels_section");
    const link = await within(section).findByTestId(
      "home.fragrance_panel.link.2",
    );
    expect(link).toHaveTextContent("Discover VESPER");

    await user.click(link);

    expect(
      await screen.findByRole("heading", { name: "VESPER" }),
    ).toBeInTheDocument();
    expect(actor.getFragrance).toHaveBeenCalledWith(2n);
  });

  it("shows the empty state when the catalogue is empty", async () => {
    const actor = makeActor();
    actor.listFragrances.mockResolvedValueOnce([]);
    renderApp(actor, "/");

    expect(
      await screen.findByTestId("home.fragrance_panels.empty_state"),
    ).toBeInTheDocument();
  });
});

describe("editorial collage composition", () => {
  it("keeps its misaligned grid and oversized typography for the fragrance features", async () => {
    const actor = makeActor();
    renderApp(actor, "/collage");

    const section = await screen.findByTestId("home.editorial_section");
    expect(
      within(section).getByRole("heading", {
        name: /Three scents from a nocturnal house/i,
      }),
    ).toBeInTheDocument();

    // Wait for the catalogue query to resolve into the fragrance features.
    await within(section).findByTestId("home.editorial_feature.1");
    await within(section).findByTestId("home.editorial_feature.2");

    // The composition stays deliberately off-grid on desktop.
    expect(section.querySelector(".md\\:col-start-7")).not.toBeNull();
    expect(section.querySelector(".md\\:-mt-16")).not.toBeNull();

    // On phones the features keep varied widths, offsets and controlled
    // overlaps rather than collapsing into a single uniform column.
    expect(section.querySelector(".col-span-9")).not.toBeNull();
    expect(section.querySelector(".col-span-10")).not.toBeNull();
    expect(section.querySelector(".col-span-11")).not.toBeNull();
    expect(section.querySelector(".col-start-3")).not.toBeNull();
    expect(section.querySelector(".-mt-10")).not.toBeNull();
  });
});

describe("homepage shell", () => {
  it("renders the header, brand and navigation around the home content", async () => {
    const actor = makeActor();
    renderApp(actor, "/");

    expect(await screen.findByTestId("site.header")).toBeInTheDocument();
    expect(screen.getByTestId("nav.brand_link")).toHaveTextContent("Mirage");
    expect(screen.getByTestId("nav.link.maison")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.editorial")).toBeInTheDocument();
    // FRAGRANCES is removed from the visible navigation bar.
    expect(screen.queryByTestId("nav.link.fragrances")).not.toBeInTheDocument();
    expect(screen.getByTestId("site.footer")).toBeInTheDocument();
  });

  it("keeps the collage and the removed intro copy off the homepage", async () => {
    const actor = makeActor();
    renderApp(actor, "/");

    await screen.findByTestId("home.hero_section");
    // The collage now lives on its own dedicated route.
    expect(
      screen.queryByTestId("home.editorial_section"),
    ).not.toBeInTheDocument();
    // The dark typographic opening sequence and its intro copy are removed.
    expect(
      screen.queryByTestId("home.opening_section"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /Composed in shadow, worn in light — an olfactory mirage/i,
      ),
    ).not.toBeInTheDocument();
  });

  it("shows the persisted bag count in the header on the homepage", async () => {
    const actor = makeActor();
    window.localStorage.setItem(
      "mirage.bag.v1",
      JSON.stringify([{ fragranceId: "1", sizeLabel: "50 ML", quantity: 3 }]),
    );
    renderApp(actor, "/");

    expect(await screen.findByTestId("nav.bag_count")).toHaveTextContent("3");
  });
});
