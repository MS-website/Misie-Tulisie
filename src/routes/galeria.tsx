import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { PageIntro } from "@/components/site/ui";
import { Space } from "@/components/site/sections";
export const Route = createFileRoute("/galeria")({
  head: () =>
    seo(
      "Galeria | Żłobek Misie Tulisie Gniezno",
      "Zobacz wnętrza żłobka Misie Tulisie w Gnieźnie.",
      "/galeria",
    ),
  component: () => (
    <>
      <PageIntro className="galeria-intro" eyebrow="Galeria" title="Nasza przestrzeń." />
      <Space full />
    </>
  ),
});
