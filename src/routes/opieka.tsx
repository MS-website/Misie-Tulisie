import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { PageIntro } from "@/components/site/ui";
import { DayTimeline, Development, FinalCTA } from "@/components/site/sections";
export const Route = createFileRoute("/opieka")({
  head: () =>
    seo(
      "Opieka | Żłobek Misie Tulisie Gniezno",
      "Rytm dnia i rozwój przez zabawę w żłobku Misie Tulisie.",
      "/opieka",
    ),
  component: () => (
    <>
      <PageIntro eyebrow="Opieka" title="Opieka, która wspiera rozwój." />
      <Development /><DayTimeline /><FinalCTA />
    </>
  ),
});
