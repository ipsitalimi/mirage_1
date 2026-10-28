# Project Guidance

## User Preferences

- Cinematic, surreal, sensual and deliberately unconventional art direction
- Near-black blood maroon base with deep crimson light, black glass surfaces, smoky red reflections and subtle film grain
- High contrast, deep shadows and restrained highlights
- Spacious, atmospheric, art-directed layouts rather than a conventional template
- Restrained motion and smooth transitions
- Do not generate images or spend credits on image generation
- Use placeholders only for assets not yet supplied
- Geometric futuristic uppercase display lettering matching the MIRAGE wordmark, paired with a restrained legible sans-serif
- Fragrance panels keep their alternating left/right composition on phones as well as desktop
- The editorial collage lives on its own dedicated page

## Accepted Requirements

- Dark typographic opening followed by the supplied full-screen hero campaign
- Asymmetrical editorial image/video collage with oversized typography crossing imagery and deliberately misaligned compositions
- Immersive overlapping full-screen fragrance panels alternating sliding in from the left and right on scroll
- Fragmented brand manifesto, contact section and minimal footer
- Functional shopping bag, product pages, selectable sizes, quantity controls, persistent cart state and a coherent demo checkout
- Consistent product data used throughout
- Use the two supplied hero images as provided, with responsive cropping and existing typography intact
- Geometric futuristic uppercase lettering matching the MIRAGE wordmark used throughout, paired with a restrained legible sans-serif
- Near-black blood maroon, deep crimson, black glass, smoky red reflections and subtle film grain
- Restrained motion, smooth transitions and strong mobile art direction
- No image generation; placeholders only for assets not yet supplied

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Backend Price is a Nat in whole currency units; formatPrice must format it directly and never divide by 100
- Biome useSemanticElements rejects role="status" on a <p>; use <output> instead, which carries the implicit status role
- TanStack Router code-based routes: createRootRoute + createRoute + addChildren + createRouter, with a Register module augmentation for typed Link and useParams
- The two supplied hero images live at src/frontend/public/assets/images/mirage-landscape.png and src/frontend/public/assets/images/mirage-portrait.png and must never be replaced or regenerated
- The hero uses a <picture> element with the landscape source at md and above and the portrait fallback below, with no text overlaid because the artwork carries the wordmark
- Fragrance panels read useFragrances and alternate the motion x offset by index parity
- Bag lines join client cart state to the catalogue by fragranceId and sizeLabel and resolve the unit price from Fragrance.sizes rather than storing it in the cart
- FragranceId is a bigint, so cart line matching uses === on bigints and keys use fragranceId-sizeLabel strings
- placeOrder returns a Result union; check __kind__ === 'err' and throw result.err before reading result.ok
- The authorization mixin makes the first non-anonymous _initialize_access_control caller #admin and later ones #user, and ignores anonymous callers
- The catalogue is a static module array rather than actor state, so the OQL Expose mixin correctly stays entities = []
- Backend size labels are uppercase with a space such as "50 ML"; slugify before using them in data-ocid segments
- Fragrance panel alternation applies at all widths by putting items-start / items-end text-right on the base classes and keeping the md: variants, so phones alternate while characterization tests still find the md: classes
- The fragrance scroll-focus uses once:false viewport so neighbouring panels recede via opacity 0.35 and scale 0.965; reduced motion sets every initial to false so the final state renders with no scaling, receding or delay
- The editorial collage lives on its own /collage route rendered by src/frontend/src/pages/CollagePage.tsx, with the Header Editorial nav link and the hero scroll cue pointing at it
- The collage phone composition uses col-span-9/10/11 with col-start offsets and negative margins inside grid-cols-12 rather than a single column
- The homepage no longer renders the OpeningSequence intro copy; it opens on the HeroCampaign picture element
- The editorial page /collage renders a perfume editorial for NOCTURNE, VESPER and OBSIDIAN from the shared catalogue notes via groupNotes(fragrance.notes) in src/frontend/src/components/home/EditorialCollage.tsx, so correcting notes in src/backend/lib/catalogue.mo fixes both the editorial and the product pages at once
- Image paths are centralised in src/frontend/src/lib/imageManifest.ts (HERO_DESKTOP_IMAGE, HERO_MOBILE_IMAGE, PRODUCT_BOTTLE_IMAGE, FRAGRANCE_IMAGERY, fragranceImages, fragranceSlug, fragranceImagery) with the asset folder at src/frontend/public/images/mirage/; components must import from the manifest instead of writing path literals
- The mobile hero uses the attached portrait campaign image at src/frontend/public/images/mirage/hero-mobile-portrait.png with its bottom fading into true black; the desktop hero keeps the unchanged landscape image
- The Header no longer shows a FRAGRANCES nav link; the shop page stays reachable from the DISCOVER and BUY NOW actions on the fragrance panels and editorial page plus the footer Shop link
- TanStack Router Link params must be omitted for param-less routes; a conditional params narrowing fails typecheck with TS2322
