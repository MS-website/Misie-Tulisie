import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { ParentsLayoutTuneRoot } from "@/components/site/ParentsLayoutTune";
import { ParentsPageSections } from "@/components/site/parents-page";

export const Route = createFileRoute("/dla-rodzicow")({
  head: () =>
    seo(
      "Dla rodziców | Żłobek Misie Tulisie Gniezno",
      "Opłaty, dofinansowania, plan dnia i wyprawka — praktyczne informacje dla rodziców.",
      "/dla-rodzicow",
    ),
  component: () => (
    <ParentsLayoutTuneRoot>
      <ParentsPageSections />
    </ParentsLayoutTuneRoot>
  ),
});
