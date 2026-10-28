import type { Fragrance } from "@/backend";
import { useFragrances } from "@/hooks/use-products";
import { fragranceImagery } from "@/lib/imageManifest";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

/** The three fragrances this editorial campaign features, in order. */
const CAMPAIGN_NAMES = ["NOCTURNE", "VESPER", "OBSIDIAN"] as const;

/**
 * Split the catalogue's flat note list into top / heart / base groups without
 * inventing any material: the first note opens the scent, the last grounds it,
 * and everything between sits at the heart.
 */
function groupNotes(notes: string[]) {
  if (notes.length === 0) return [];
  if (notes.length === 1) return [{ label: "Top", notes }];
  if (notes.length === 2) {
    return [
      { label: "Top", notes: notes.slice(0, 1) },
      { label: "Base", notes: notes.slice(1) },
    ];
  }
  return [
    { label: "Top", notes: notes.slice(0, 1) },
    { label: "Heart", notes: notes.slice(1, -1) },
    { label: "Base", notes: notes.slice(-1) },
  ];
}

/** Art-directed placement per feature: varied widths, offsets and alignment. */
const FEATURE_LAYOUT = [
  {
    figure: "col-span-9 col-start-1 md:col-span-5 md:col-start-1 md:row-span-2",
    align: "items-start text-left md:items-start md:text-left",
    image: "aspect-[4/5]",
    drift: -28,
  },
  {
    figure:
      "col-span-10 col-start-3 -mt-10 md:col-span-6 md:col-start-7 md:mt-24",
    align: "items-end text-right md:items-end md:text-right",
    image: "aspect-[3/4]",
    drift: 32,
  },
  {
    figure:
      "col-span-11 col-start-2 -mt-12 md:col-span-7 md:col-start-4 md:-mt-16",
    align: "items-start text-left md:items-start md:text-left",
    image: "aspect-[5/6]",
    drift: -22,
  },
] as const;

function FragranceFeature({
  fragrance,
  index,
}: {
  fragrance: Fragrance;
  index: number;
}) {
  const reduceMotion = useReducedMotion();
  const layout = FEATURE_LAYOUT[index % FEATURE_LAYOUT.length];
  const groups = groupNotes(fragrance.notes);
  const image = fragranceImagery(fragrance.name).campaign;
  const params = { fragranceId: fragrance.id.toString() };

  return (
    <motion.figure
      data-ocid={`home.editorial_feature.${index + 1}`}
      initial={reduceMotion ? false : { opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{
        duration: 0.7,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`relative flex flex-col gap-6 ${layout.figure} ${layout.align}`}
    >
      {/* Masked media reveal with a slight positional drift into focus. */}
      <motion.div
        initial={reduceMotion ? false : { clipPath: "inset(0 0 100% 0)" }}
        whileInView={{ clipPath: "inset(0 0 0% 0)" }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          duration: 0.85,
          delay: index * 0.06,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={`grain-overlay relative w-full overflow-hidden border border-border/60 bg-card ${layout.image}`}
      >
        <motion.img
          src={image}
          alt={`${fragrance.name} — ${fragrance.tagline}`}
          loading="lazy"
          decoding="async"
          initial={reduceMotion ? false : { scale: 1.08, x: layout.drift }}
          whileInView={{ scale: 1, x: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 1.1,
            delay: index * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="h-full w-full object-cover"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-smoke opacity-60"
        />
        <span className="absolute left-4 top-4 text-label text-foreground/70">
          {String(index + 1).padStart(2, "0")}
        </span>
      </motion.div>

      {/* Typography tightens into focus as the feature enters the viewport. */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          duration: 0.75,
          delay: 0.12 + index * 0.06,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="flex w-full flex-col gap-4"
      >
        <motion.h3
          initial={reduceMotion ? false : { letterSpacing: "0.32em" }}
          whileInView={{ letterSpacing: "0.18em" }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.8,
            delay: index * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="font-display text-[13vw] uppercase leading-[0.9] text-foreground md:text-[5vw]"
        >
          {fragrance.name}
        </motion.h3>

        <p className="max-w-md font-display text-base uppercase tracking-brand text-accent md:text-lg">
          {fragrance.tagline}
        </p>

        <p className="max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
          {fragrance.description}
        </p>

        <dl
          data-ocid={`home.editorial_feature.notes.${index + 1}`}
          className={`flex w-full max-w-md flex-col gap-3 border-t border-border/60 pt-4 ${
            layout.align.includes("text-right") ? "items-end" : "items-start"
          }`}
        >
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <dt className="text-label text-muted-foreground">
                {group.label}
              </dt>
              <dd className="font-mono text-xs uppercase tracking-wider text-foreground/90">
                {group.notes.join(" / ")}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-2 flex flex-wrap items-center gap-x-8 gap-y-3">
          <Link
            to="/product/$fragranceId"
            params={params}
            data-ocid={`home.editorial_feature.discover.${index + 1}`}
            className="group flex w-fit items-center gap-3 border-b border-accent/60 pb-1 text-label text-foreground transition-smooth hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Discover
            <span
              aria-hidden="true"
              className="h-px w-8 bg-accent transition-smooth group-hover:w-14"
            />
          </Link>
          <Link
            to="/product/$fragranceId"
            params={params}
            data-ocid={`home.editorial_feature.buy.${index + 1}`}
            className="text-label text-accent transition-smooth hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            Buy now
          </Link>
        </div>
      </motion.div>
    </motion.figure>
  );
}

/**
 * Editorial fragrance campaign. The page keeps its asymmetrical, art-directed
 * composition — oversized display type, offset text, thin rules and small
 * uppercase annotations — but now presents three fragrances from the catalogue.
 * Each feature resolves with a restrained focus effect: the media reveals
 * through a clip mask with a slight drift while the typography tightens into
 * place. All motion is disabled when the visitor prefers reduced motion.
 */
export function EditorialCollage() {
  const { data: fragrances, isLoading } = useFragrances();

  const featured = CAMPAIGN_NAMES.map((name) =>
    (fragrances ?? []).find((fragrance) => fragrance.name === name),
  ).filter((fragrance): fragrance is Fragrance => fragrance !== undefined);

  return (
    <section
      id="editorial"
      data-ocid="home.editorial_section"
      aria-label="Editorial fragrance campaign"
      className="relative w-full scroll-mt-24 px-5 py-24 md:px-10 md:py-40"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <div className="mb-16 flex flex-col gap-4 md:mb-24 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-2xl font-display text-4xl uppercase leading-[0.95] tracking-brand text-foreground md:text-6xl">
            Three scents from a
            <br />
            <span className="text-accent">nocturnal</span> house
          </h2>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            An editorial campaign in misalignment — type that refuses the grid
            and imagery that refuses the frame.
          </p>
        </div>

        {isLoading && (
          <div
            data-ocid="home.editorial_section.loading_state"
            className="grid grid-cols-12 gap-x-4 gap-y-20 md:gap-x-8 md:gap-y-32"
          >
            {Array.from({ length: 3 }, (_, i) => `editorial-skeleton-${i}`).map(
              (id) => (
                <div
                  key={id}
                  className="col-span-9 aspect-[4/5] w-full animate-pulse border border-border/50 bg-card/50"
                />
              ),
            )}
          </div>
        )}

        {!isLoading && featured.length === 0 && (
          <p
            data-ocid="home.editorial_section.empty_state"
            className="font-display text-2xl uppercase tracking-brand text-muted-foreground"
          >
            The campaign is being composed
          </p>
        )}

        {featured.length > 0 && (
          <div className="grid grid-cols-12 gap-x-4 gap-y-20 md:gap-x-8 md:gap-y-32">
            {featured.map((fragrance, index) => (
              <FragranceFeature
                key={fragrance.id.toString()}
                fragrance={fragrance}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
