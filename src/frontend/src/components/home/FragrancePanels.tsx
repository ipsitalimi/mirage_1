import { useFragrances } from "@/hooks/use-products";
import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";

/**
 * Immersive overlapping full-screen fragrance panels. Each panel holds the
 * visitor's focus as it scrolls into view: the oversized title scales down into
 * place while the surrounding details resolve a beat later, and neighbouring
 * panels recede through reduced opacity and scale. The alternating left/right
 * composition applies on phones as well as desktop.
 */
export function FragrancePanels() {
  const { data: fragrances, isLoading } = useFragrances();
  const reduceMotion = useReducedMotion();

  const panels = fragrances ?? [];

  return (
    <section
      data-ocid="home.fragrance_panels_section"
      aria-label="The fragrances"
      className="relative w-full"
    >
      {isLoading && (
        <div
          data-ocid="home.fragrance_panels.loading_state"
          className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-5 py-24 md:px-10"
        >
          {Array.from({ length: 2 }, (_, i) => `panel-skeleton-${i}`).map(
            (id) => (
              <div
                key={id}
                className="h-[60svh] w-full animate-pulse border border-border/50 bg-card/50"
              />
            ),
          )}
        </div>
      )}

      {!isLoading && panels.length === 0 && (
        <div
          data-ocid="home.fragrance_panels.empty_state"
          className="mx-auto w-full max-w-[1600px] px-5 py-24 text-center md:px-10"
        >
          <p className="font-display text-2xl uppercase tracking-brand text-muted-foreground">
            The collection is being composed
          </p>
        </div>
      )}

      {panels.map((fragrance, index) => {
        const fromLeft = index % 2 === 0;
        return (
          <motion.article
            key={fragrance.id.toString()}
            data-ocid={`home.fragrance_panel.${index + 1}`}
            initial={reduceMotion ? false : { opacity: 0.35, scale: 0.965 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.55 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex min-h-[100svh] w-full items-center overflow-hidden border-t border-border/50"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-smoke opacity-50"
            />

            <div
              className={`relative mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-5 py-24 md:px-10 ${
                fromLeft
                  ? "items-start md:items-start"
                  : "items-end text-right md:items-end md:text-right"
              }`}
            >
              <motion.span
                initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.55 }}
                transition={{
                  duration: 0.8,
                  delay: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="text-label text-accent"
              >
                {String(index + 1).padStart(2, "0")} ·{" "}
                {fragrance.notes.slice(0, 2).join(" / ")}
              </motion.span>

              <motion.h3
                initial={reduceMotion ? false : { opacity: 0, scale: 1.14 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false, amount: 0.55 }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-full font-display text-[13vw] uppercase leading-[0.85] tracking-brand text-foreground md:text-[8vw]"
              >
                {fragrance.name}
              </motion.h3>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.55 }}
                transition={{
                  duration: 0.9,
                  delay: 0.24,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="max-w-xl font-display text-lg uppercase tracking-brand text-accent md:text-2xl"
              >
                {fragrance.tagline}
              </motion.p>

              <motion.p
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.55 }}
                transition={{
                  duration: 0.9,
                  delay: 0.32,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="max-w-lg text-sm leading-relaxed text-muted-foreground md:text-base"
              >
                {fragrance.description}
              </motion.p>

              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.55 }}
                transition={{
                  duration: 0.9,
                  delay: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className={`mt-2 flex flex-wrap items-center gap-x-8 gap-y-4 ${
                  fromLeft ? "justify-start" : "justify-end"
                }`}
              >
                <Link
                  to="/product/$fragranceId"
                  params={{ fragranceId: fragrance.id.toString() }}
                  data-ocid={`home.fragrance_panel.link.${index + 1}`}
                  className="group flex w-fit items-center gap-3 border-b border-accent/60 pb-1 text-label text-foreground transition-smooth hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  Discover {fragrance.name}
                  <span
                    aria-hidden="true"
                    className="h-px w-8 bg-accent transition-smooth group-hover:w-14"
                  />
                </Link>

                <Link
                  to="/product/$fragranceId"
                  params={{ fragranceId: fragrance.id.toString() }}
                  data-ocid={`home.fragrance_panel.buy_now.${index + 1}`}
                  className="group flex w-fit items-center gap-3 border border-accent/70 px-6 py-3 text-label text-foreground transition-smooth hover:border-accent hover:bg-accent/10 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                >
                  Buy now
                  <span
                    aria-hidden="true"
                    className="h-px w-6 bg-accent transition-smooth group-hover:w-10"
                  />
                </Link>
              </motion.div>
            </div>
          </motion.article>
        );
      })}
    </section>
  );
}
