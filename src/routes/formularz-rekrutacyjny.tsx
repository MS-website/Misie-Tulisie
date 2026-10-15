import { useLayoutEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { ButtonA, Reveal } from "@/components/site/ui";

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
          <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
            Kartę zgłoszenia dziecka pobierzecie Państwo w pliku PDF.
          </p>
          <ButtonA
            href="/karta-zgloszenia-dziecka.pdf"
            download="karta-zgloszenia-dziecka.pdf"
            className="mt-8"
          >
            Pobierz kartę zgłoszenia
          </ButtonA>
        </Reveal>
      </section>
    </>
  );
}

export const Route = createFileRoute("/formularz-rekrutacyjny")({
  head: () => ({
    meta: seo(
      "Formularz rekrutacyjny | Żłobek Misie Tulisie Gniezno",
      "Karta zgłoszenia dziecka do żłobka Misie Tulisie w Gnieźnie — plik PDF do pobrania.",
    ),
  }),
  component: FormularzPage,
});
