# Design Brief

## Direction

Blood Glass — an experimental, art-led luxury fragrance house rendered as a nocturnal gallery of black glass, crimson smoke and oversized letterforms.

## Tone

Cinematic and deliberately unconventional: near-black blood maroon, deep crimson light, deep shadows and restrained highlights — sensual, surreal, gallery-like, never a conventional shop template.

## Differentiation

Oversized wide-tracked MIRAGE display lettering crossing over imagery and sliding fragrance panels, all suspended in a film-grain crimson haze that makes the site feel like a scent you can see.

## Color Palette

| Token      | OKLCH        | Role                                        |
| ---------- | ------------ | ------------------------------------------- |
| background | 0.11 0.018 12 | Near-black blood maroon page base           |
| foreground | 0.94 0.006 20 | Bone-white body and heading text            |
| card       | 0.145 0.022 14 | Black glass surfaces, panels, product cards |
| primary    | 0.52 0.19 18  | Deep crimson actions, primary buttons       |
| accent     | 0.62 0.2 20   | Smoky red highlights, active states, links  |
| muted      | 0.19 0.02 14  | Recessed blocks, captions, placeholder media |
| border     | 0.26 0.03 16  | Hairline crimson-tinted rules and dividers  |

## Typography

- Display: Space Grotesk — all headings, hero wordmark, section titles; uppercase, wide tracking, geometric
- Body: General Sans — descriptions, product copy, forms; restrained and highly legible
- Mono: JetBrains Mono — captions, labels, prices, size selectors, nav meta (`.text-label`)
- Scale: hero `text-5xl md:text-7xl lg:text-8xl tracking-brand uppercase`, h2 `text-3xl md:text-5xl uppercase tracking-brand`, label `text-label`, body `text-base md:text-lg`

## Elevation & Depth

Depth comes from layered near-black surfaces, black-glass panels with crimson inner glow (`shadow-glass`), and a fixed film-grain overlay — no flat backgrounds, no neon glow.

## Structural Zones

| Zone    | Background                  | Border                | Notes                                              |
| ------- | --------------------------- | --------------------- | -------------------------------------------------- |
| Header  | transparent → glass on scroll | hairline `border-b` | Fixed minimal bar, brand mark left, bag right      |
| Content | `bg-background` + gradient  | —                     | Alternating `bg-card` / `bg-muted/30` editorial bands |
| Footer  | `bg-card` / `bg-muted/40`   | `border-t`            | Brand mark, minimal links, mono meta               |

## Spacing & Rhythm

Generous, atmospheric: sections use `py-24 md:py-40`, asymmetric grids with deliberate misalignment, and tight micro-spacing (`gap-2`–`gap-6`) inside dense typographic clusters.

## Component Patterns

- Buttons: sharp near-square (`rounded-sm`), crimson `bg-primary` fill or hairline ghost outline, hover lifts to `bg-accent` with `transition-smooth`
- Cards: `rounded-sm` black glass (`glass-surface` + `shadow-glass`), image-led, minimal chrome
- Badges: mono uppercase pill with hairline crimson border, transparent fill

## Motion

- Entrance: `fade-up` / `fade-in` on scroll, 0.9–1.2s `cubic-bezier(0.22, 1, 0.36, 1)`, staggered
- Hover: `transition-smooth` (0.45s) on color, border and slight translate; no bounce
- Decorative: `smoke-drift` ambient crimson haze; fragrance panels `slide-in-left` / `slide-in-right`; all disabled under `prefers-reduced-motion`

## Constraints

- Dark-only art direction; no light theme
- No image generation — use supplied hero images and styled placeholder blocks only
- Tokens only in components: no raw hex, rgb, or arbitrary color classes
- Supplied hero images used exactly as provided, no duplicate text overlaid

## Signature Detail

Oversized wide-tracked MIRAGE display type crossing over imagery inside a drifting film-grain crimson haze — typographic treatment.
