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
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

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

const routeTree = rootRoute.addChildren([
  homeRoute,
  collageRoute,
  productRoute,
  bagRoute,
  checkoutRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
