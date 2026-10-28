import type { Fragrance } from "@/backend";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/hooks/use-cart";
import { BagPage } from "@/pages/BagPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
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

/**
 * Characterization baseline for the editorial rework. These assertions protect
 * behavior the accepted request does not intentionally change: the desktop hero
 * artwork and its scroll cue, the fragrance panel composition and its product
 * links, the header shell, the /collage route reachability, and the shop flow.
 * The intentional changes (perfume editorial content, FRAGRANCES removal,
 * portrait mobile hero, image manifest) are deliberately not asserted here.
 */

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
  const bagRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/bag",
    component: BagPage,
  });
  const checkoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/checkout",
    component: CheckoutPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      homeRoute,
      collageRoute,
      productRoute,
      bagRoute,
      checkoutRoute,
    ]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultPendingMinMs: 0,
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("homepage hero campaign", () => {
  it("keeps the desktop landscape source and the portrait fallback", async () => {
    const actor = makeActor();
    renderApp(actor, "/");

    const hero = await screen.findByTestId("home.hero_section");
    const image = within(hero).getByRole("img");
    // The mobile hero now uses the portrait campaign image from the manifest.
    expect(image).toHaveAttribute(
      "src",
      "/images/mirage/hero-mobile-portrait.png",
    );
    expect(
      hero.querySelector('source[media="(min-width: 768px)"]'),
    ).toHaveAttribute("srcset", "/assets/images/mirage-landscape.png");
    // The artwork carries the wordmark, so no text is overlaid on it.
    expect(within(hero).queryByRole("heading")).not.toBeInTheDocument();
  });

  it("keeps the scroll cue into the editorial page", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/");

    const cue = await screen.findByTestId("home.hero_scroll_cue");
    expect(cue).toHaveTextContent("Enter the editorial");
    await user.click(cue);

    expect(await screen.findByTestId("collage.page")).toBeInTheDocument();
  });
});

describe("fragrance panels", () => {
  it("renders one panel per catalogue fragrance with name, tagline and notes", async () => {
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

  it("keeps the alternating left/right composition at every width", async () => {
    const actor = makeActor();
    renderApp(actor, "/");

    const section = await screen.findByTestId("home.fragrance_panels_section");
    const first = await within(section).findByTestId("home.fragrance_panel.1");
    const second = within(section).getByTestId("home.fragrance_panel.2");

    // Even index aligns to the start, odd index to the end with right-aligned
    // text — base classes on phones, md: variants on desktop.
    expect(first.querySelector(".items-start")).not.toBeNull();
    expect(first.querySelector(".md\\:items-start")).not.toBeNull();
    expect(second.querySelector(".items-end")).not.toBeNull();
    expect(second.querySelector(".text-right")).not.toBeNull();
    expect(second.querySelector(".md\\:items-end")).not.toBeNull();
    expect(second.querySelector(".md\\:text-right")).not.toBeNull();
  });

  it("links each panel into its own product page", async () => {
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

describe("header shell", () => {
  it("keeps the brand, Maison and Editorial navigation and the bag link", async () => {
    const actor = makeActor();
    renderApp(actor, "/");

    expect(await screen.findByTestId("site.header")).toBeInTheDocument();
    expect(screen.getByTestId("nav.brand_link")).toHaveTextContent("Mirage");
    expect(screen.getByTestId("nav.link.maison")).toBeInTheDocument();
    expect(screen.getByTestId("nav.link.editorial")).toBeInTheDocument();
    expect(screen.getByTestId("nav.bag_link")).toBeInTheDocument();
  });

  it("reaches the editorial page from the header Editorial link", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/");

    await screen.findByTestId("site.header");
    await user.click(screen.getByTestId("nav.link.editorial"));

    expect(await screen.findByTestId("collage.page")).toBeInTheDocument();
  });

  it("shows the persisted bag count in the header", async () => {
    const actor = makeActor();
    window.localStorage.setItem(
      "mirage.bag.v1",
      JSON.stringify([{ fragranceId: "1", sizeLabel: "50 ML", quantity: 3 }]),
    );
    renderApp(actor, "/");

    expect(await screen.findByTestId("nav.bag_count")).toHaveTextContent("3");
  });
});

describe("shop flow", () => {
  it("adds a product to the bag and reflects it in the header count", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/product/1");

    await screen.findByRole("heading", { name: "NOCTURNE" });
    await user.click(screen.getByRole("button", { name: /50 ML/ }));
    await user.click(screen.getByTestId("product.add_to_bag_button"));

    expect(await screen.findByTestId("nav.bag_count")).toHaveTextContent("1");
    const stored = JSON.parse(
      window.localStorage.getItem("mirage.bag.v1") ?? "[]",
    );
    expect(stored).toEqual([
      { fragranceId: "1", sizeLabel: "50 ML", quantity: 1 },
    ]);
  });

  it("keeps the bag page reachable and functional from the header", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    window.localStorage.setItem(
      "mirage.bag.v1",
      JSON.stringify([{ fragranceId: "1", sizeLabel: "50 ML", quantity: 2 }]),
    );
    renderApp(actor, "/");

    await screen.findByTestId("site.header");
    await user.click(screen.getByTestId("nav.bag_link"));

    const item = await screen.findByTestId("bag.item.1");
    expect(within(item).getByText("NOCTURNE")).toBeInTheDocument();
    expect(screen.getByTestId("bag.total")).toHaveTextContent("€520.00");
  });

  it("validates checkout details before placing an order", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    window.localStorage.setItem(
      "mirage.bag.v1",
      JSON.stringify([{ fragranceId: "1", sizeLabel: "50 ML", quantity: 1 }]),
    );
    renderApp(actor, "/checkout");

    await screen.findByTestId("checkout.form");
    await user.click(screen.getByTestId("checkout.submit_button"));

    expect(
      await screen.findByTestId("checkout.error.fullName"),
    ).toHaveTextContent("Required");
  });
});
