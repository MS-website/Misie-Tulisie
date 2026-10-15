import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { ParentsPageSections } from "@/components/site/parents-page";

export const Route = createFileRoute("/dla-rodzicow")({
  head: () => ({
    meta: seo(
      "Dla rodziców | Żłobek Misie Tulisie Gniezno",
      "Opłaty, dofinansowania, plan dnia i wyprawka — praktyczne informacje dla rodziców.",
    ),
  }),
  component: () => <ParentsPageSections />,
});
