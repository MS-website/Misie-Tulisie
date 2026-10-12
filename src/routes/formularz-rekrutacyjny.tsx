import { useLayoutEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { Reveal } from "@/components/site/ui";
import { RecruitmentForm } from "@/components/site/RecruitmentForm";

function FormularzPage() {
  useLayoutEffect(() => {
    document.body.dataset["frame"] = "formularz";
    return () => {
      delete document.body.dataset["frame"];
    };
  }, []);

  return (
    <>
      <section className="container-site pt-28 pb-8 md:pt-36 md:pb-12">
        <Reveal>
          <h1 className="font-display max-w-4xl text-5xl md:text-7xl lg:text-8xl">
            Formularz rekrutacyjny
          </h1>
          <p className="eyebrow mt-6">Rekrutacja</p>
        </Reveal>
      </section>
      <section className="container-site pb-6 md:pb-8">
        <Reveal>
          <RecruitmentForm />
        </Reveal>
      </section>
    </>
  );
}

export const Route = createFileRoute("/formularz-rekrutacyjny")({
  head: () => ({
    meta: seo(
      "Formularz rekrutacyjny | Żłobek Misie Tulisie Gniezno",
      "Formularz rekrutacyjny do żłobka Misie Tulisie w Gnieźnie.",
    ),
  }),
  component: FormularzPage,
});
