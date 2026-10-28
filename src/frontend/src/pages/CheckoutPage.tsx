import { createActor } from "@/backend";
import type { Order, OrderItemRequest, Result } from "@/backend";
import {
  DeliveryForm,
  type DeliveryFormValues,
  EMPTY_DELIVERY,
  toDeliveryDetails,
  validateDelivery,
} from "@/components/checkout/DeliveryForm";
import {
  OrderConfirmationSummary,
  OrderSummary,
} from "@/components/checkout/OrderSummary";
import { useCart } from "@/hooks/use-cart";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, Check } from "lucide-react";
import { useState } from "react";

function describeOrderError(result: Result): string {
  if (result.__kind__ === "ok") return "";
  switch (result.err.__kind__) {
    case "emptyOrder":
      return "Your bag is empty. Add a fragrance before placing an order.";
    case "unknownFragrance":
      return "One of your fragrances is no longer available. Please review your bag.";
    case "unknownSize":
      return "One of your selected sizes is no longer available. Please review your bag.";
    case "invalidQuantity":
      return "One of your quantities is invalid. Please review your bag.";
    default:
      return "We could not place your order. Please try again.";
  }
}

export function CheckoutPage() {
  const { actor } = useActor(createActor);
  const { lines, clear } = useCart();
  const [values, setValues] = useState<DeliveryFormValues>(EMPTY_DELIVERY);
  const [errors, setErrors] = useState<
    Partial<Record<keyof DeliveryFormValues, string>>
  >({});
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const mutation = useMutation({
    mutationFn: async (): Promise<Order> => {
      if (!actor) throw new Error("Backend is not ready");
      const items: OrderItemRequest[] = lines.map((line) => ({
        fragranceId: line.fragranceId,
        sizeLabel: line.sizeLabel,
        quantity: BigInt(line.quantity),
      }));
      const result = await actor.placeOrder(toDeliveryDetails(values), items);
      if (result.__kind__ === "err") {
        throw new Error(describeOrderError(result));
      }
      return result.ok;
    },
    onSuccess: (order) => {
      setPlacedOrder(order);
      clear();
    },
  });

  function handleChange(name: keyof DeliveryFormValues, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateDelivery(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    if (lines.length === 0) return;
    mutation.mutate();
  }

  if (placedOrder) {
    return (
      <section
        data-ocid="checkout.confirmation"
        className="mx-auto w-full max-w-[1600px] px-5 pb-28 pt-32 md:px-10 md:pt-40"
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
          <div className="flex flex-col gap-6">
            <span className="text-label text-accent">Order confirmed</span>
            <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-brand text-foreground md:text-6xl">
              The house
              <br />
              has your order
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
              Thank you, {placedOrder.delivery.fullName}. Your selection is
              reserved and a confirmation has been recorded against your email.
            </p>
            <div className="flex items-center gap-3 text-accent">
              <Check className="h-5 w-5" aria-hidden="true" />
              <span className="text-label">Demo order — no payment taken</span>
            </div>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/"
                data-ocid="checkout.confirmation.home_link"
                className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 font-display text-sm uppercase tracking-brand text-primary-foreground transition-smooth hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                Return to the maison
              </Link>
            </div>
          </div>
          <div className="lg:pt-4">
            <OrderConfirmationSummary order={placedOrder} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      data-ocid="checkout.page"
      className="mx-auto w-full max-w-[1600px] px-5 pb-28 pt-32 md:px-10 md:pt-40"
    >
      <div className="flex flex-col gap-4">
        <Link
          to="/bag"
          data-ocid="checkout.back_link"
          className="inline-flex w-fit items-center gap-2 text-label text-muted-foreground transition-smooth hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to bag
        </Link>
        <span className="text-label text-accent">Demo checkout</span>
        <h1 className="font-display text-4xl uppercase leading-[0.95] tracking-brand text-foreground md:text-6xl">
          Complete
          <br />
          the order
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Enter your delivery details. This is a demonstration checkout — no
          payment is processed and no card is required.
        </p>
      </div>

      <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-20">
        <form
          data-ocid="checkout.form"
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-8"
        >
          <div className="flex flex-col gap-6">
            <h2 className="font-display text-lg uppercase tracking-brand text-foreground">
              Delivery details
            </h2>
            <DeliveryForm
              values={values}
              errors={errors}
              disabled={mutation.isPending}
              onChange={handleChange}
            />
          </div>

          {mutation.isError && (
            <p
              data-ocid="checkout.error_state"
              role="alert"
              className="rounded-sm border border-destructive/60 bg-destructive/10 px-4 py-3 text-sm text-foreground"
            >
              {mutation.error instanceof Error
                ? mutation.error.message
                : "We could not place your order. Please try again."}
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="submit"
              data-ocid="checkout.submit_button"
              disabled={mutation.isPending || lines.length === 0}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-primary px-8 py-4 font-display text-sm uppercase tracking-brand text-primary-foreground transition-smooth hover:bg-accent hover:text-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {mutation.isPending ? "Placing order…" : "Place order"}
            </button>
            {lines.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Your bag is empty —{" "}
                <Link
                  to="/"
                  data-ocid="checkout.empty_bag_link"
                  className="text-accent underline-offset-4 hover:underline"
                >
                  explore the fragrances
                </Link>
                .
              </p>
            )}
          </div>
        </form>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <OrderSummary />
        </div>
      </div>
    </section>
  );
}
