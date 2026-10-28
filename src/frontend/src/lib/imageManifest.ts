/**
 * MIRAGE image manifest — the single source of truth for every image path.
 *
 * Components never inline an image path; they read it from here so that
 * replacing artwork is a one-line change in one file. Paths are served from
 * `src/frontend/public`, so a value of `/images/mirage/hero-desktop.png`
 * resolves to `public/images/mirage/hero-desktop.png`.
 *
 * Two families of assets live here:
 *
 * 1. Supplied artwork that already exists and must keep its current
 *    appearance. The desktop hero and the shared product bottle still live
 *    under `/assets/images/` and are referenced at those exact paths — they
 *    are never moved, renamed or regenerated.
 * 2. Assets that do not exist yet. Each carries a documented placeholder
 *    filename under `/images/mirage/` so a future replacement is a drop-in
 *    file swap with no code change. Until then the UI falls back to the
 *    supplied artwork, so nothing renders broken.
 */

/** Descriptive filename for the desktop hero campaign artwork (supplied). */
export const HERO_DESKTOP_IMAGE = "/assets/images/mirage-landscape.png";

/**
 * Descriptive filename for the mobile hero campaign artwork (supplied).
 * Portrait crop of the campaign, saved into the organised asset folder.
 */
export const HERO_MOBILE_IMAGE = "/images/mirage/hero-mobile-portrait.png";

/**
 * Shared product bottle image used by the product page (supplied).
 * A single house flacon stands in for every fragrance until per-fragrance
 * product photography is supplied.
 */
export const PRODUCT_BOTTLE_IMAGE = "/assets/images/mirage-portrait.png";

/** A fragrance's imagery: a wide campaign frame and a product still. */
export interface FragranceImagery {
  /** Wide editorial campaign frame for the fragrance. */
  campaign: string;
  /** Product still of the fragrance bottle. */
  product: string;
}

/**
 * Per-fragrance imagery keyed by the catalogue slug (the lowercase fragrance
 * name). Every entry currently points at a documented placeholder filename
 * under `/images/mirage/`; drop the real file in at that path to replace it.
 */
export const FRAGRANCE_IMAGERY: Record<string, FragranceImagery> = {
  nocturne: {
    campaign: "/images/mirage/nocturne-campaign.png",
    product: "/images/mirage/nocturne-product.png",
  },
  vesper: {
    campaign: "/images/mirage/vesper-campaign.png",
    product: "/images/mirage/vesper-product.png",
  },
  halo: {
    campaign: "/images/mirage/halo-campaign.png",
    product: "/images/mirage/halo-product.png",
  },
  seraph: {
    campaign: "/images/mirage/seraph-campaign.png",
    product: "/images/mirage/seraph-product.png",
  },
  obsidian: {
    campaign: "/images/mirage/obsidian-campaign.png",
    product: "/images/mirage/obsidian-product.png",
  },
};

/**
 * Campaign image per fragrance, keyed by the uppercase catalogue name
 * (`fragranceImages["NOCTURNE"]`). This is the lookup the editorial collage
 * consumes. No per-fragrance campaign frame has been supplied yet, so every
 * entry resolves to the supplied desktop hero artwork and the collage keeps
 * its current appearance; swap in a real file at the documented placeholder
 * path in `FRAGRANCE_IMAGERY` to replace it.
 */
export const fragranceImages: Record<string, string> = Object.fromEntries(
  Object.entries(FRAGRANCE_IMAGERY).map(([slug]) => [
    slug.toUpperCase(),
    HERO_DESKTOP_IMAGE,
  ]),
);

/** Normalise a fragrance name into its manifest slug. */
export function fragranceSlug(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Resolve a fragrance's imagery by name, falling back to the shared supplied
 * artwork when no per-fragrance entry exists yet.
 */
export function fragranceImagery(name: string): FragranceImagery {
  return (
    FRAGRANCE_IMAGERY[fragranceSlug(name)] ?? {
      campaign: HERO_DESKTOP_IMAGE,
      product: PRODUCT_BOTTLE_IMAGE,
    }
  );
}
