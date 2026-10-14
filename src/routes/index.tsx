import { createFileRoute } from "@tanstack/react-router";
import missionPhoto from "@/assets/story.jpg";
import playPhoto from "@/assets/rozwój-zabawa.jpg";
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
  head: () => ({
    meta: seo(
      "Żłobek Misie Tulisie | Gniezno",
      "Misie Tulisie to bezpieczny i przyjazny żłobek w Gnieźnie. Ciepła przestrzeń, w której dzieci rozwijają się we własnym tempie.",
    ),
    links: [
      { rel: "preload", as: "image", href: missionPhoto },
      { rel: "preload", as: "image", href: playPhoto },
    ],
  }),
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
