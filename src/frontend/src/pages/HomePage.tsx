import { ContactSection } from "@/components/home/ContactSection";
import { FragrancePanels } from "@/components/home/FragrancePanels";
import { HeroCampaign } from "@/components/home/HeroCampaign";
import { Manifesto } from "@/components/home/Manifesto";

/**
 * The MIRAGE home experience — a cinematic sequence that opens on the supplied
 * hero campaign, moves through immersive fragrance panels, a fragmented
 * manifesto and finally the house contact section. The editorial collage now
 * lives on its own dedicated page.
 */
export function HomePage() {
  return (
    <div data-ocid="home.page" className="flex w-full flex-col">
      <HeroCampaign />
      <FragrancePanels />
      <Manifesto />
      <ContactSection />
    </div>
  );
}
