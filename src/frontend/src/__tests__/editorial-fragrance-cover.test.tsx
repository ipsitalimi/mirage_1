import type { Fragrance } from "@/backend";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/hooks/use-cart";
import { BagPage } from "@/pages/BagPage";
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
 * Cover for the accepted perfume-editorial rework: the /collage page presents
 * exactly NOCTURNE, VESPER and OBSIDIAN with their notes and DISCOVER/BUY NOW
 * actions, FRAGRANCES is gone from the navigation, and the shop flow stays
 * reachable from the editorial actions.
 */

const CATALOGUE: Fragrance[] = [
  {
    id: 1n,
    name: "NOCTURNE",
    tagline: "A wound that never closes.",
    description: "Smoke over cold stone.",
    notes: ["Black Plum", "Incense", "Smoked Woods"],
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
    notes: ["Amber", "Sea Salt", "Skin Musk"],
    sizes: [{ sizeLabel: "50 ML", price: 285n }],
  },
  {
    id: 3n,
    name: "HALO",
    tagline: "A crown of static.",
    description: "Bright, almost clinical, then wrong.",
    notes: ["Aldehyde", "Black Tea", "Iris", "Cold Metal"],
    sizes: [{ sizeLabel: "50 ML", price: 300n }],
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
  const bagRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/bag",
    component: BagPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([
      homeRoute,
      collageRoute,
      productRoute,
      bagRoute,
    ]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultPendingMinMs: 0,
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("perfume editorial on /collage", () => {
  it("presents exactly the three campaign fragrances with their notes", async () => {
    const actor = makeActor();
    renderApp(actor, "/collage");

    const section = await screen.findByTestId("home.editorial_section");
    const features = await within(section).findAllByTestId(
      /home\.editorial_feature\.\d+/,
    );
    // Exactly three features, and HALO is not among them.
    expect(features).toHaveLength(3);
    expect(within(section).queryByText("HALO")).not.toBeInTheDocument();

    const nocturne = within(section).getByTestId("home.editorial_feature.1");
    expect(
      within(nocturne).getByRole("heading", { name: "NOCTURNE" }),
    ).toBeInTheDocument();
    const nocturneNotes = within(nocturne).getByTestId(
      "home.editorial_feature.notes.1",
    );
    expect(nocturneNotes).toHaveTextContent("Black Plum");
    expect(nocturneNotes).toHaveTextContent("Incense");
    expect(nocturneNotes).toHaveTextContent("Smoked Woods");

    const vesper = within(section).getByTestId("home.editorial_feature.2");
    expect(
      within(vesper).getByRole("heading", { name: "VESPER" }),
    ).toBeInTheDocument();
    const vesperNotes = within(vesper).getByTestId(
      "home.editorial_feature.notes.2",
    );
    expect(vesperNotes).toHaveTextContent("Amber");
    expect(vesperNotes).toHaveTextContent("Sea Salt");
    expect(vesperNotes).toHaveTextContent("Skin Musk");

    const obsidian = within(section).getByTestId("home.editorial_feature.3");
    expect(
      within(obsidian).getByRole("heading", { name: "OBSIDIAN" }),
    ).toBeInTheDocument();
    const obsidianNotes = within(obsidian).getByTestId(
      "home.editorial_feature.notes.3",
    );
    expect(obsidianNotes).toHaveTextContent("Black Pepper");
    expect(obsidianNotes).toHaveTextContent("Vetiver");
    expect(obsidianNotes).toHaveTextContent("Mineral Accord");
  });

  it("gives every feature a poetic description and DISCOVER and BUY NOW actions", async () => {
    const actor = makeActor();
    renderApp(actor, "/collage");

    const section = await screen.findByTestId("home.editorial_section");
    await within(section).findByTestId("home.editorial_feature.1");

    for (const index of [1, 2, 3]) {
      const feature = within(section).getByTestId(
        `home.editorial_feature.${index}`,
      );
      expect(
        within(feature).getByTestId(`home.editorial_feature.discover.${index}`),
      ).toHaveTextContent("Discover");
      expect(
        within(feature).getByTestId(`home.editorial_feature.buy.${index}`),
      ).toHaveTextContent("Buy now");
    }

    // The poetic description from the catalogue is rendered for each feature.
    expect(
      within(section).getByText("Smoke over cold stone."),
    ).toBeInTheDocument();
    expect(
      within(section).getByText("An amber that behaves like a memory."),
    ).toBeInTheDocument();
    expect(
      within(section).getByText("The house signature, stripped to its bones."),
    ).toBeInTheDocument();
  });

  it("opens the matching product page from a feature's DISCOVER action", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/collage");

    const section = await screen.findByTestId("home.editorial_section");
    const discover = await within(section).findByTestId(
      "home.editorial_feature.discover.3",
    );
    await user.click(discover);

    expect(
      await screen.findByRole("heading", { name: "OBSIDIAN" }),
    ).toBeInTheDocument();
    expect(actor.getFragrance).toHaveBeenCalledWith(5n);
  });

  it("opens the matching product page from a feature's BUY NOW action", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/collage");

    const section = await screen.findByTestId("home.editorial_section");
    const buy = await within(section).findByTestId(
      "home.editorial_feature.buy.2",
    );
    await user.click(buy);

    expect(
      await screen.findByRole("heading", { name: "VESPER" }),
    ).toBeInTheDocument();
    expect(actor.getFragrance).toHaveBeenCalledWith(2n);
  });
});

describe("navigation without FRAGRANCES", () => {
  it("shows no FRAGRANCES link in the desktop or mobile navigation", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/");

    await screen.findByTestId("site.header");
    expect(screen.queryByTestId("nav.link.fragrances")).not.toBeInTheDocument();

    // Open the mobile menu and confirm the link is absent there too.
    await user.click(screen.getByTestId("nav.menu_toggle"));
    const mobileMenu = await screen.findByTestId("nav.mobile_menu");
    expect(
      within(mobileMenu).queryByTestId("nav.mobile_link.fragrances"),
    ).not.toBeInTheDocument();
    expect(
      within(mobileMenu).getByTestId("nav.mobile_link.editorial"),
    ).toBeInTheDocument();
  });

  it("keeps the shop reachable from the footer Shop link", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/");

    await screen.findByTestId("site.footer");
    await user.click(screen.getByTestId("footer.link.shop"));

    expect(
      await screen.findByRole("heading", { name: "NOCTURNE" }),
    ).toBeInTheDocument();
  });
});

describe("editorial to shop journey", () => {
  it("adds a fragrance to the bag from the product page reached via BUY NOW", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/collage");

    const section = await screen.findByTestId("home.editorial_section");
    await user.click(
      await within(section).findByTestId("home.editorial_feature.buy.1"),
    );

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
});
