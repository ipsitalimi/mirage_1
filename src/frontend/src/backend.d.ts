import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Cell {
    value: Value;
    name: string;
}
export interface DeliveryDetails {
    country: string;
    city: string;
    postalCode: string;
    fullName: string;
    email: string;
    address: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Fragrance {
    id: FragranceId;
    tagline: string;
    name: string;
    description: string;
    sizes: Array<Size>;
    notes: Array<string>;
}
export type FragranceId = bigint;
export interface LineItem {
    lineTotal: Price;
    sizeLabel: string;
    quantity: bigint;
    fragranceId: FragranceId;
}
export interface Order {
    id: OrderId;
    total: Price;
    delivery: DeliveryDetails;
    items: Array<LineItem>;
}
export type OrderError = {
    __kind__: "unknownFragrance";
    unknownFragrance: FragranceId;
} | {
    __kind__: "unknownSize";
    unknownSize: {
        sizeLabel: string;
        fragranceId: FragranceId;
    };
} | {
    __kind__: "emptyOrder";
    emptyOrder: null;
} | {
    __kind__: "invalidQuantity";
    invalidQuantity: {
        sizeLabel: string;
        fragranceId: FragranceId;
    };
};
export type OrderId = bigint;
export interface OrderItemRequest {
    sizeLabel: string;
    quantity: bigint;
    fragranceId: FragranceId;
}
export type Price = bigint;
export type Result = {
    __kind__: "ok";
    ok: Order;
} | {
    __kind__: "err";
    err: OrderError;
};
export type Result_1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Result__1 {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export interface Size {
    sizeLabel: string;
    price: Price;
}
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result__1>;
    /**
     * / Return the backend API documentation as static Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Return a single fragrance by id, or null when it does not exist.
     */
    getFragrance(id: FragranceId): Promise<Fragrance | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Return every fragrance in the catalogue.
     */
    listFragrances(): Promise<Array<Fragrance>>;
    /**
     * / Place a demo order from the supplied delivery details and requested items.
     */
    placeOrder(delivery: DeliveryDetails, items: Array<OrderItemRequest>): Promise<Result>;
    schema(): Promise<string>;
}
