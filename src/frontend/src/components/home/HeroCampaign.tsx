import { HERO_DESKTOP_IMAGE, HERO_MOBILE_IMAGE } from "@/lib/imageManifest";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

/**
 * Full-screen hero campaign. The supplied artwork already carries the MIRAGE
 * wordmark and tagline, so no text is overlaid on it — the section only frames
 * the image and closes with a scroll cue into the dedicated editorial page.
 */
export function HeroCampaign() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      data-ocid="home.hero_section"
      aria-label="Mirage campaign"
      className="relative w-full"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 1.04 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-[100svh] w-full overflow-hidden bg-background"
      >
        <picture>
          <source media="(min-width: 768px)" srcSet={HERO_DESKTOP_IMAGE} />
          <img
            src={HERO_MOBILE_IMAGE}
            alt="Mirage campaign — a figure in black silk holding a faceted flacon as crimson smoke unfurls across a near-black maroon field."
            className="h-full w-full object-cover object-center"
            loading="eager"
            decoding="async"
          />
        </picture>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent"
        />
      </motion.div>

      <div className="relative mx-auto flex w-full max-w-[1600px] items-center justify-between gap-6 px-5 py-10 md:px-10">
        <span className="text-label text-muted-foreground">
          Campaign · Souviens-toi
        </span>
        <Link
          to="/collage"
          data-ocid="home.hero_scroll_cue"
          className="group flex items-center gap-3 text-label text-accent transition-smooth hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
        >
          Enter the editorial
          <span
            aria-hidden="true"
            className="h-px w-10 bg-accent transition-smooth group-hover:w-16"
          />
        </Link>
      </div>
    </section>
  );
}
