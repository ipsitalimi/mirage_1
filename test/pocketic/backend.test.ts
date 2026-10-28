import { PocketIc } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("lists the seeded catalogue without trapping", async () => {
  const fragrances = await actor.listFragrances();
  expect(fragrances.length).toBeGreaterThan(0);
  for (const fragrance of fragrances) {
    expect(fragrance.name.length).toBeGreaterThan(0);
    expect(fragrance.sizes.length).toBeGreaterThan(0);
  }
});

it("serves the corrected campaign notes for NOCTURNE, VESPER and OBSIDIAN", async () => {
  const catalogue = await actor.listFragrances();
  const byName = new Map(catalogue.map((fragrance) => [fragrance.name, fragrance]));

  expect(byName.get("NOCTURNE")?.notes).toEqual([
    "Black Plum",
    "Incense",
    "Smoked Woods",
  ]);
  expect(byName.get("VESPER")?.notes).toEqual([
    "Amber",
    "Sea Salt",
    "Skin Musk",
  ]);
  expect(byName.get("OBSIDIAN")?.notes).toEqual([
    "Black Pepper",
    "Vetiver",
    "Mineral Accord",
  ]);
});

it("returns a single fragrance by id and null for an unknown id", async () => {
  const first = await actor.getFragrance(1n);
  expect(first).toHaveLength(1);
  expect(first[0].id).toBe(1n);

  const missing = await actor.getFragrance(9999n);
  expect(missing).toEqual([]);
});

it("places a demo order and prices it from the catalogue", async () => {
  const catalogue = await actor.listFragrances();
  const fragrance = catalogue[0];
  const size = fragrance.sizes[0];

  const result = await actor.placeOrder(
    {
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      address: "12 Rue de la Lune",
      city: "Paris",
      postalCode: "75002",
      country: "France",
    },
    [{ fragranceId: fragrance.id, sizeLabel: size.sizeLabel, quantity: 2n }],
  );

  expect(result).toHaveProperty("ok");
  if (!("ok" in result)) throw new Error("expected an ok order");
  expect(result.ok.items).toHaveLength(1);
  expect(result.ok.items[0].lineTotal).toBe(size.price * 2n);
  expect(result.ok.total).toBe(size.price * 2n);
  expect(result.ok.delivery.fullName).toBe("Ada Lovelace");
});

it("rejects an empty order", async () => {
  const result = await actor.placeOrder(
    {
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      address: "12 Rue de la Lune",
      city: "Paris",
      postalCode: "75002",
      country: "France",
    },
    [],
  );
  expect(result).toEqual({ err: { emptyOrder: null } });
});

it("rejects an unknown size", async () => {
  const result = await actor.placeOrder(
    {
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      address: "12 Rue de la Lune",
      city: "Paris",
      postalCode: "75002",
      country: "France",
    },
    [{ fragranceId: 1n, sizeLabel: "999 ML", quantity: 1n }],
  );
  expect(result).toEqual({
    err: { unknownSize: { fragranceId: 1n, sizeLabel: "999 ML" } },
  });
});
