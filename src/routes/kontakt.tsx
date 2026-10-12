import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { PageIntro } from "@/components/site/ui";
import { ContactBlock } from "@/components/site/sections";
export const Route = createFileRoute("/kontakt")({
  head: () => ({ meta: seo("Kontakt | Żłobek Misie Tulisie Gniezno", "Kontakt: ul. Poznańska 99, Gniezno, tel. +48 791 201 298.") }),
  component: () => (
    <>
      <PageIntro eyebrow="Kontakt" title="Zapraszamy do nas." />
      <ContactBlock />
    </>
  ),
});
