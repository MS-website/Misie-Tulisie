import { createFileRoute } from "@tanstack/react-router";
import heroWalk from "@/assets/story.jpg";
import missionKids from "@/assets/rozwój-zabawa.jpg";
import { seo } from "@/lib/site";
import {
  HomeDiscover,
  HomeHero,
  HomeIndividualApproach,
  HomeMission,
  HomePlayGrowth,
  HomeSpace,
} from "@/components/site/home";

export const Route = createFileRoute("/")({
  head: () => {
    const { meta, links } = seo(
      "Żłobek Misie Tulisie | Gniezno",
      "Misie Tulisie to bezpieczny i przyjazny żłobek w Gnieźnie. Ciepła przestrzeń, w której dzieci rozwijają się we własnym tempie.",
      "/",
    );
    return {
      meta,
      links: [
        ...links,
        { rel: "preload", as: "image", href: heroWalk },
        { rel: "preload", as: "image", href: missionKids },
      ],
    };
  },
  component: () => (
    <>
      <HomeHero />
      <HomeMission />
      <HomePlayGrowth />
      <HomeSpace />
      <HomeIndividualApproach />
      <HomeDiscover />
    </>
  ),
});
