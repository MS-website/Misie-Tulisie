import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { FinalCTA, Hero, Story, TrustBar } from "@/components/site/sections";
export const Route = createFileRoute("/")({
  head: () => ({ meta: seo("Żłobek Misie Tulisie | Gniezno", "Misie Tulisie to bezpieczny i przyjazny żłobek w Gnieźnie. Ciepła przestrzeń, w której dzieci rozwijają się we własnym tempie.") }),
  component: () => (
    <>
      <Hero />
      <TrustBar />
      <Story />
      <FinalCTA />
    </>
  ),
});
