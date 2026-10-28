import type { DeliveryDetails } from "@/backend";
import { cn } from "@/lib/utils";
import { useId } from "react";

export interface DeliveryFormValues {
  fullName: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export const EMPTY_DELIVERY: DeliveryFormValues = {
  fullName: "",
  email: "",
  address: "",
  city: "",
  postalCode: "",
  country: "",
};

interface FieldSpec {
  name: keyof DeliveryFormValues;
  label: string;
  autoComplete: string;
  type?: string;
  span?: "full" | "half";
  placeholder?: string;
}

const FIELDS: FieldSpec[] = [
  {
    name: "fullName",
    label: "Full name",
    autoComplete: "name",
    span: "full",
    placeholder: "Vivienne Marchetti",
  },
  {
    name: "email",
    label: "Email",
    autoComplete: "email",
    type: "email",
    span: "full",
    placeholder: "you@example.com",
  },
  {
    name: "address",
    label: "Address",
    autoComplete: "street-address",
    span: "full",
    placeholder: "12 Rue de la Lune",
  },
  {
    name: "city",
    label: "City",
    autoComplete: "address-level2",
    span: "half",
    placeholder: "Paris",
  },
  {
    name: "postalCode",
    label: "Postal code",
    autoComplete: "postal-code",
    span: "half",
    placeholder: "75002",
  },
  {
    name: "country",
    label: "Country",
    autoComplete: "country-name",
    span: "full",
    placeholder: "France",
  },
];

const FIELD_CLASS =
  "w-full rounded-sm border border-input bg-background/60 px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground/60 transition-smooth focus-visible:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

interface DeliveryFormProps {
  values: DeliveryFormValues;
  errors: Partial<Record<keyof DeliveryFormValues, string>>;
  disabled?: boolean;
  onChange: (name: keyof DeliveryFormValues, value: string) => void;
}

export function DeliveryForm({
  values,
  errors,
  disabled,
  onChange,
}: DeliveryFormProps) {
  const groupId = useId();

  return (
    <fieldset
      data-ocid="checkout.delivery_form"
      disabled={disabled}
      className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2"
    >
      <legend className="sr-only">Delivery details</legend>
      {FIELDS.map((field) => {
        const inputId = `${groupId}-${field.name}`;
        const errorId = `${inputId}-error`;
        const message = errors[field.name];
        return (
          <div
            key={field.name}
            className={cn(
              "flex flex-col gap-2",
              field.span === "full" ? "sm:col-span-2" : "sm:col-span-1",
            )}
          >
            <label
              htmlFor={inputId}
              className="text-label text-muted-foreground"
            >
              {field.label}
            </label>
            <input
              id={inputId}
              name={field.name}
              type={field.type ?? "text"}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              value={values[field.name]}
              aria-invalid={message ? true : undefined}
              aria-describedby={message ? errorId : undefined}
              data-ocid={`checkout.input.${field.name}`}
              onChange={(event) => onChange(field.name, event.target.value)}
              className={cn(
                FIELD_CLASS,
                message &&
                  "border-destructive focus-visible:border-destructive",
              )}
            />
            {message && (
              <p
                id={errorId}
                data-ocid={`checkout.error.${field.name}`}
                className="font-mono text-[0.6875rem] uppercase tracking-wider text-destructive"
              >
                {message}
              </p>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}

/** Validate the draft and return a map of field-level messages. */
export function validateDelivery(
  values: DeliveryFormValues,
): Partial<Record<keyof DeliveryFormValues, string>> {
  const errors: Partial<Record<keyof DeliveryFormValues, string>> = {};
  if (!values.fullName.trim()) errors.fullName = "Required";
  if (!values.email.trim()) {
    errors.email = "Required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Enter a valid email";
  }
  if (!values.address.trim()) errors.address = "Required";
  if (!values.city.trim()) errors.city = "Required";
  if (!values.postalCode.trim()) errors.postalCode = "Required";
  if (!values.country.trim()) errors.country = "Required";
  return errors;
}

/** Convert a validated draft into the backend's DeliveryDetails shape. */
export function toDeliveryDetails(values: DeliveryFormValues): DeliveryDetails {
  return {
    fullName: values.fullName.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
    city: values.city.trim(),
    postalCode: values.postalCode.trim(),
    country: values.country.trim(),
  };
}
