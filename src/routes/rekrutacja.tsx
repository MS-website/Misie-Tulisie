import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { PageIntro } from "@/components/site/ui";
import { Adaptation, Recruitment, RecruitmentRules, RecruitmentSteps } from "@/components/site/sections";
export const Route = createFileRoute("/rekrutacja")({
  head: () => ({ meta: seo("Rekrutacja | Żłobek Misie Tulisie Gniezno", "Zapytaj o wolne miejsce w żłobku Misie Tulisie w Gnieźnie.") }),
  component: () => (
    <>
      <PageIntro eyebrow="Rekrutacja" title="Dołącz do Misiów Tulisiów" />
      <RecruitmentRules />
      <RecruitmentSteps />
      <Adaptation />
      <Recruitment />
    </>
  ),
});
