import { EditorialCollage } from "@/components/home/EditorialCollage";

/**
 * Dedicated page for the "Fragments of a Nocturnal House" editorial collage.
 * The collage keeps its deliberately misaligned composition, now reachable from
 * the site navigation rather than embedded in the homepage sequence.
 */
export function CollagePage() {
  return (
    <div
      data-ocid="collage.page"
      className="flex w-full flex-col pt-16 md:pt-20"
    >
      <EditorialCollage />
    </div>
  );
}
