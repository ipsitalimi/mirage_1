import type { Fragrance, Order, Result } from "@/backend";
import { CartProvider } from "@/hooks/use-cart";
import { BagPage } from "@/pages/BagPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { ProductPage } from "@/pages/ProductPage";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen, waitFor, within } from "@testing-library/react";
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
    placeOrder: vi.fn<
      (
        delivery: Parameters<
          NonNullable<Parameters<typeof renderWithActor>[1]>["placeOrder"]
        >[0],
        items: Parameters<
          NonNullable<Parameters<typeof renderWithActor>[1]>["placeOrder"]
        >[1],
      ) => Promise<Result>
    >(async (delivery, items) => {
      const order: Order = {
        id: 1n,
        total: items.reduce((sum, item) => sum + item.quantity * 260n, 0n),
        delivery,
        items: items.map((item) => ({
          fragranceId: item.fragranceId,
          sizeLabel: item.sizeLabel,
          quantity: item.quantity,
          lineTotal: item.quantity * 260n,
        })),
      };
      return { __kind__: "ok", ok: order };
    }),
  };
}

/** A router mirroring App.tsx so pages get real params and navigation. */
function renderApp(actor: ReturnType<typeof makeActor>, initialPath: string) {
  const rootRoute = createRootRoute({
    component: () => (
      <CartProvider>
        <Outlet />
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
  const checkoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/checkout",
    component: CheckoutPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([productRoute, bagRoute, checkoutRoute]),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
    defaultPendingMinMs: 0,
  });
  return renderWithActor(<RouterProvider router={router} />, actor);
}

beforeEach(() => {
  window.localStorage.clear();
});

describe("product page", () => {
  it("renders the fragrance from the shared catalogue with its sizes and prices", async () => {
    const actor = makeActor();
    renderApp(actor, "/product/1");

    expect(
      await screen.findByRole("heading", { name: "NOCTURNE" }),
    ).toBeInTheDocument();
    expect(screen.getByText("A wound that never closes.")).toBeInTheDocument();
    expect(screen.getByText("Black Plum")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /30 ML/ })).toBeInTheDocument();
    expect(actor.getFragrance).toHaveBeenCalledWith(1n);
  });

  it("adds the selected size and quantity to the bag with confirmation", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/product/1");

    await screen.findByRole("heading", { name: "NOCTURNE" });

    // Default size is the first (30 ML); raise quantity to 2.
    await user.click(screen.getByRole("button", { name: "Increase quantity" }));
    expect(screen.getByTestId("product.quantity_value")).toHaveTextContent("2");

    await user.click(screen.getByTestId("product.add_to_bag_button"));

    expect(
      await screen.findByTestId("product.success_state"),
    ).toHaveTextContent("2 × 30 ML");
    const stored = JSON.parse(
      window.localStorage.getItem("mirage.bag.v1") ?? "[]",
    );
    expect(stored).toEqual([
      { fragranceId: "1", sizeLabel: "30 ML", quantity: 2 },
    ]);
  });

  it("re-prices the total when a different size is selected", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    renderApp(actor, "/product/1");

    await screen.findByRole("heading", { name: "NOCTURNE" });
    // Prices are whole currency units: 180 renders as €180.00, not €1.80.
    expect(screen.getByTestId("product.total_price")).toHaveTextContent(
      "€180.00",
    );

    await user.click(screen.getByRole("button", { name: /50 ML/ }));
    expect(screen.getByTestId("product.total_price")).toHaveTextContent(
      "€260.00",
    );
  });
});

describe("bag page", () => {
  it("shows product, size, quantity and line total, and updates on quantity change", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    window.localStorage.setItem(
      "mirage.bag.v1",
      JSON.stringify([{ fragranceId: "1", sizeLabel: "50 ML", quantity: 2 }]),
    );
    renderApp(actor, "/bag");

    const item = await screen.findByTestId("bag.item.1");
    expect(within(item).getByText("NOCTURNE")).toBeInTheDocument();
    expect(within(item).getByText("50 ML")).toBeInTheDocument();
    expect(screen.getByTestId("bag.quantity.1")).toHaveTextContent("2");
    // 2 × €260.00, whole currency units.
    expect(screen.getByTestId("bag.line_total.1")).toHaveTextContent("€520.00");
    expect(screen.getByTestId("bag.total")).toHaveTextContent("€520.00");

    await user.click(screen.getByTestId("bag.increment_button.1"));
    expect(screen.getByTestId("bag.quantity.1")).toHaveTextContent("3");
    expect(screen.getByTestId("bag.line_total.1")).toHaveTextContent("€780.00");
    expect(screen.getByTestId("bag.total")).toHaveTextContent("€780.00");
  });

  it("removes a line and returns to the empty state", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    window.localStorage.setItem(
      "mirage.bag.v1",
      JSON.stringify([{ fragranceId: "1", sizeLabel: "50 ML", quantity: 1 }]),
    );
    renderApp(actor, "/bag");

    await screen.findByTestId("bag.item.1");
    await user.click(screen.getByTestId("bag.remove_button.1"));

    expect(await screen.findByTestId("bag.empty_state")).toBeInTheDocument();
    expect(screen.queryByTestId("bag.item.1")).not.toBeInTheDocument();
  });

  it("shows the empty state when the bag has no lines", async () => {
    const actor = makeActor();
    renderApp(actor, "/bag");
    expect(await screen.findByTestId("bag.empty_state")).toBeInTheDocument();
  });
});

describe("checkout", () => {
  it("validates delivery details before placing an order", async () => {
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
    expect(actor.placeOrder).not.toHaveBeenCalled();
  });

  it("places the order and shows the confirmation summary", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    window.localStorage.setItem(
      "mirage.bag.v1",
      JSON.stringify([{ fragranceId: "1", sizeLabel: "50 ML", quantity: 2 }]),
    );
    renderApp(actor, "/checkout");

    await screen.findByTestId("checkout.form");
    await user.type(
      screen.getByTestId("checkout.input.fullName"),
      "Ada Lovelace",
    );
    await user.type(
      screen.getByTestId("checkout.input.email"),
      "ada@example.com",
    );
    await user.type(screen.getByTestId("checkout.input.address"), "12 Rue");
    await user.type(screen.getByTestId("checkout.input.city"), "Paris");
    await user.type(screen.getByTestId("checkout.input.postalCode"), "75002");
    await user.type(screen.getByTestId("checkout.input.country"), "France");

    await user.click(screen.getByTestId("checkout.submit_button"));

    expect(
      await screen.findByTestId("checkout.confirmation"),
    ).toBeInTheDocument();
    expect(actor.placeOrder).toHaveBeenCalledTimes(1);
    const [delivery, items] = actor.placeOrder.mock.calls[0];
    expect(delivery.fullName).toBe("Ada Lovelace");
    expect(items).toEqual([
      { fragranceId: 1n, sizeLabel: "50 ML", quantity: 2n },
    ]);
    expect(screen.getByTestId("checkout.confirmation.total")).toHaveTextContent(
      "€520.00",
    );
    // The bag is cleared after a successful order.
    await waitFor(() =>
      expect(window.localStorage.getItem("mirage.bag.v1")).toBe("[]"),
    );
  });

  it("surfaces a backend order error to the visitor", async () => {
    const user = userEvent.setup();
    const actor = makeActor();
    actor.placeOrder.mockResolvedValueOnce({
      __kind__: "err",
      err: {
        __kind__: "unknownSize",
        unknownSize: { fragranceId: 1n, sizeLabel: "50 ML" },
      },
    });
    window.localStorage.setItem(
      "mirage.bag.v1",
      JSON.stringify([{ fragranceId: "1", sizeLabel: "50 ML", quantity: 1 }]),
    );
    renderApp(actor, "/checkout");

    await screen.findByTestId("checkout.form");
    await user.type(screen.getByTestId("checkout.input.fullName"), "Ada");
    await user.type(
      screen.getByTestId("checkout.input.email"),
      "ada@example.com",
    );
    await user.type(screen.getByTestId("checkout.input.address"), "12 Rue");
    await user.type(screen.getByTestId("checkout.input.city"), "Paris");
    await user.type(screen.getByTestId("checkout.input.postalCode"), "75002");
    await user.type(screen.getByTestId("checkout.input.country"), "France");
    await user.click(screen.getByTestId("checkout.submit_button"));

    expect(await screen.findByTestId("checkout.error_state")).toHaveTextContent(
      "no longer available",
    );
  });
});
