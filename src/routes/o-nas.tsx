import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { PageIntro } from "@/components/site/ui";
import { Story, Team } from "@/components/site/sections";
import {
  AboutIntro,
  CareAreas,
  Foundations,
  GalleryVisit,
  WhyMisie,
} from "@/components/site/about";

export const Route = createFileRoute("/o-nas")({
  head: () =>
    seo(
      "O nas | Żłobek Misie Tulisie Gniezno",
      "Poznaj żłobek Misie Tulisie w Gnieźnie — nasze wartości i zespół.",
      "/o-nas",
    ),
  component: () => (
    <>
      <PageIntro className="subpage-intro o-nas-intro" eyebrow="O nas" title="Ciepło, spokój i uważność." />
      <Story cta={false} />
      <AboutIntro />
      <Foundations />
      <CareAreas />
      <Team />
      <WhyMisie />
      <GalleryVisit />
    </>
  ),
});
