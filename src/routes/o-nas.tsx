import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { PageIntro } from "@/components/site/ui";
import { Story, Values, Team, FinalCTA } from "@/components/site/sections";
export const Route = createFileRoute("/o-nas")({
  head: () => ({ meta: seo("O nas | Żłobek Misie Tulisie Gniezno", "Poznaj żłobek Misie Tulisie w Gnieźnie — nasze wartości i zespół.") }),
  component: () => (
    <>
      <PageIntro eyebrow="O nas" title="Ciepło, spokój i uważność." />
      <Story cta={false} /><Values /><Team /><FinalCTA />
    </>
  ),
});
