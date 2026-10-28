import { motion, useReducedMotion } from "motion/react";

const WORDS = ["MIRAGE", "SOUVIENS-TOI"];

/**
 * Brief dark typographic overture. Establishes the house name and tone before
 * the hero campaign, then hands the eye down to the scroll cue.
 */
export function OpeningSequence() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      data-ocid="home.opening_section"
      aria-label="Mirage — opening"
      className="relative flex min-h-[92svh] w-full flex-col justify-center overflow-hidden px-5 pb-24 pt-32 md:px-10 md:pt-40"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-smoke opacity-70"
      />

      <div className="relative mx-auto flex w-full max-w-[1600px] flex-col gap-8">
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-label text-accent"
        >
          Maison de parfum · Paris
        </motion.span>

        <h1 className="flex flex-col">
          {WORDS.map((word, index) => (
            <motion.span
              key={word}
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.1,
                delay: 0.15 + index * 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={
                index === 0
                  ? "font-display text-[18vw] uppercase leading-[0.82] tracking-brand text-foreground md:text-[13vw]"
                  : "mt-2 font-display text-[7vw] uppercase leading-none tracking-brand text-muted-foreground md:text-[3.4vw]"
              }
            >
              {word}
            </motion.span>
          ))}
        </h1>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.1 }}
        className="relative mx-auto mt-16 flex w-full max-w-[1600px] items-center gap-4"
      >
        <span className="text-label text-muted-foreground">Scroll</span>
        <span
          aria-hidden="true"
          className="h-px w-16 bg-gradient-to-r from-accent to-transparent md:w-28"
        />
      </motion.div>
    </section>
  );
}
