import { motion, useReducedMotion } from "motion/react";

type ManifestoBlock = {
  id: string;
  text: string;
  className: string;
  emphasis?: boolean;
};

const BLOCKS: ManifestoBlock[] = [
  {
    id: "manifesto-1",
    text: "We do not make perfume.",
    className: "md:col-span-7 md:col-start-1",
  },
  {
    id: "manifesto-2",
    text: "We build mirages —",
    className: "md:col-span-6 md:col-start-4 md:-mt-6",
    emphasis: true,
  },
  {
    id: "manifesto-3",
    text: "scent that remembers a room you have never entered.",
    className: "md:col-span-8 md:col-start-3 md:mt-4",
  },
  {
    id: "manifesto-4",
    text: "Worn in shadow. Read in light.",
    className: "md:col-span-5 md:col-start-8 md:-mt-2",
    emphasis: true,
  },
];

/**
 * Fragmented brand manifesto — broken, art-directed typographic blocks that
 * refuse a single column and drift across the page.
 */
export function Manifesto() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      data-ocid="home.manifesto_section"
      aria-label="Manifesto"
      className="relative w-full border-t border-border/50 px-5 py-24 md:px-10 md:py-40"
    >
      <div className="mx-auto w-full max-w-[1600px]">
        <span className="text-label text-accent">Manifesto</span>

        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-y-16">
          {BLOCKS.map((block, index) => (
            <motion.p
              key={block.id}
              data-ocid={`home.manifesto_block.${index + 1}`}
              initial={reduceMotion ? false : { opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{
                duration: 0.9,
                delay: index * 0.06,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={`font-display uppercase leading-[0.95] tracking-brand ${
                block.emphasis
                  ? "text-3xl text-accent md:text-5xl"
                  : "text-2xl text-foreground md:text-4xl"
              } ${block.className}`}
            >
              {block.text}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
