import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { PageIntro } from "@/components/site/ui";
import { ParentsSection, FinalCTA } from "@/components/site/sections";
export const Route = createFileRoute("/dla-rodzicow")({
  head: () => ({ meta: seo("Dla rodziców | Żłobek Misie Tulisie Gniezno", "Adaptacja, posiłki, sen i bezpieczeństwo — odpowiedzi dla rodziców.") }),
  component: () => (
    <>
      <PageIntro eyebrow="Dla rodziców" title="Wszystko, co warto wiedzieć." />
      <ParentsSection /><FinalCTA />
    </>
  ),
});
