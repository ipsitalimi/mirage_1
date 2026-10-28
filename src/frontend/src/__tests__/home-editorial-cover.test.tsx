import type { Fragrance } from "@/backend";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/hooks/use-cart";
import { CollagePage } from "@/pages/CollagePage";
import { HomePage } from "@/pages/HomePage";
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
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute, collageRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultPendingMinMs: 0,
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("dedicated editorial collage route", () => {
  it("renders the collage on /collage with its misaligned composition", async () => {
    const actor = makeActor();
    renderApp(actor, "/collage");

    const section = await screen.findByTestId("home.editorial_section");
    expect(
      within(section).getByRole("heading", {
        name: /Three scents from a nocturnal house/i,
      }),
    ).toBeInTheDocument();
    // The editorial now presents the fragrance features from the catalogue.
    expect(
      await within(section).findByTestId("home.editorial_feature.1"),
    ).toBeInTheDocument();
    expect(
      within(section).getByTestId("home.editorial_feature.2"),
    ).toBeInTheDocument();
  });

  it("reaches the collage from the hero scroll cue", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/");

    const cue = await screen.findByTestId("home.hero_scroll_cue");
    expect(cue).toHaveTextContent("Enter the editorial");
    await user.click(cue);

    expect(
      await screen.findByTestId("home.editorial_section"),
    ).toBeInTheDocument();
  });

  it("reaches the collage from the header Editorial navigation link", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/");

    await screen.findByTestId("site.header");
    await user.click(screen.getByTestId("nav.link.editorial"));

    expect(
      await screen.findByTestId("home.editorial_section"),
    ).toBeInTheDocument();
  });
});

describe("collage entrance", () => {
  it("reveals each fragrance feature through a clip mask with staggered typography", async () => {
    const actor = makeActor();
    renderApp(actor, "/collage");

    const section = await screen.findByTestId("home.editorial_section");
    // Wait for the catalogue query to resolve into the three features.
    await within(section).findByTestId("home.editorial_feature.1");
    // Each feature's media is wrapped in a masked motion element.
    const masked = section.querySelectorAll('[style*="clip-path"]');
    expect(masked.length).toBeGreaterThanOrEqual(2);
  });
});
