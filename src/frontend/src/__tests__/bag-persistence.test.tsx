import type { Fragrance } from "@/backend";
import { Layout } from "@/components/Layout";
import { CartProvider } from "@/hooks/use-cart";
import { BagPage } from "@/pages/BagPage";
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

/** A router mirroring App.tsx, wrapped in the real site shell so the header renders. */
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
    routeTree: rootRoute.addChildren([productRoute, bagRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultPendingMinMs: 0,
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("header bag count", () => {
  it("updates the header count when a product is added to the bag", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/product/1");

    await screen.findByRole("heading", { name: "NOCTURNE" });
    // No badge before anything is added.
    expect(screen.queryByTestId("nav.bag_count")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    await user.click(screen.getByTestId("product.add_to_bag_button"));

    expect(await screen.findByTestId("nav.bag_count")).toHaveTextContent("2");
  });

  it("shows the persisted count in the header on a fresh load", async () => {
    const actor = makeActor();
    window.localStorage.setItem(
      "mirage.bag.v1",
      JSON.stringify([{ fragranceId: "1", sizeLabel: "50 ML", quantity: 3 }]),
    );
    renderApp(actor, "/bag");

    expect(await screen.findByTestId("nav.bag_count")).toHaveTextContent("3");
  });
});

describe("cart persistence", () => {
  it("keeps the bag across navigation from product to bag", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/product/1");

    await screen.findByRole("heading", { name: "NOCTURNE" });
    await user.click(screen.getByRole("button", { name: /50 ML/ }));
    await user.click(screen.getByTestId("product.add_to_bag_button"));
    await screen.findByTestId("product.success_state");

    await user.click(screen.getByTestId("product.view_bag_link"));

    const item = await screen.findByTestId("bag.item.1");
    expect(within(item).getByText("NOCTURNE")).toBeInTheDocument();
    expect(within(item).getByText("50 ML")).toBeInTheDocument();
    expect(screen.getByTestId("bag.quantity.1")).toHaveTextContent("1");
    expect(screen.getByTestId("bag.line_total.1")).toHaveTextContent("€260.00");
  });

  it("restores the bag from storage after a simulated refresh", async () => {
    const actor = makeActor();
    window.localStorage.setItem(
      "mirage.bag.v1",
      JSON.stringify([{ fragranceId: "1", sizeLabel: "30 ML", quantity: 2 }]),
    );
    renderApp(actor, "/bag");

    const item = await screen.findByTestId("bag.item.1");
    expect(within(item).getByText("30 ML")).toBeInTheDocument();
    expect(screen.getByTestId("bag.quantity.1")).toHaveTextContent("2");
    // 2 × €180.00, whole currency units.
    expect(screen.getByTestId("bag.line_total.1")).toHaveTextContent("€360.00");
    expect(screen.getByTestId("bag.total")).toHaveTextContent("€360.00");
  });
});
