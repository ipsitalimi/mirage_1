import {
  FRAGRANCE_IMAGERY,
  HERO_DESKTOP_IMAGE,
  HERO_MOBILE_IMAGE,
  PRODUCT_BOTTLE_IMAGE,
  fragranceImagery,
  fragranceImages,
  fragranceSlug,
} from "@/lib/imageManifest";
import { describe, expect, it } from "vitest";

/**
 * The central image manifest is the single source of truth for image paths.
 * These assertions protect the accepted contract: the supplied desktop hero and
 * product bottle keep their existing paths, the mobile hero lives in the new
 * asset folder, and every fragrance resolves through the manifest.
 */
describe("image manifest", () => {
  it("keeps the supplied desktop hero and product bottle at their existing paths", () => {
    expect(HERO_DESKTOP_IMAGE).toBe("/assets/images/mirage-landscape.png");
    expect(PRODUCT_BOTTLE_IMAGE).toBe("/assets/images/mirage-portrait.png");
  });

  it("points the mobile hero at the new asset folder", () => {
    expect(HERO_MOBILE_IMAGE).toBe("/images/mirage/hero-mobile-portrait.png");
  });

  it("resolves per-fragrance imagery through the manifest", () => {
    expect(fragranceSlug("  NOCTURNE ")).toBe("nocturne");
    expect(fragranceImagery("NOCTURNE")).toEqual(FRAGRANCE_IMAGERY.nocturne);
    expect(fragranceImagery("OBSIDIAN")).toEqual(FRAGRANCE_IMAGERY.obsidian);
    // The campaign lookup is keyed by the uppercase catalogue name.
    expect(fragranceImages.NOCTURNE).toBe(HERO_DESKTOP_IMAGE);
  });

  it("falls back to the supplied artwork for an unknown fragrance", () => {
    expect(fragranceImagery("UNKNOWN")).toEqual({
      campaign: HERO_DESKTOP_IMAGE,
      product: PRODUCT_BOTTLE_IMAGE,
    });
  });
});
