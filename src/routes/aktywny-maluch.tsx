import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/site";
import { PageIntro } from "@/components/site/ui";
import fe from "@/assets/fundusze-europejskie-dla-rozwoju-spolecznego.png";
import rp from "@/assets/rzeczpospolita-polska.png";
import ue from "@/assets/dofinansowane-przez-unie-europejska.png";

const znaki = [
  {
    src: fe,
    alt: "Fundusze Europejskie dla Rozwoju Społecznego",
    width: 1024,
    height: 417,
  },
  {
    src: rp,
    alt: "Rzeczpospolita Polska",
    width: 1024,
    height: 341,
  },
  {
    src: ue,
    alt: "Dofinansowane przez Unię Europejską",
    width: 489,
    height: 185,
  },
] as const;

const zrodla = [
  "Środki europejskie (BSE) – 665 647,48 zł (82,52 % dofinansowania)",
  "Środki dofinansowania w formie współfinansowania krajowego środków europejskich ( BP) –141 002,42 zł (17,48 % dofinansowania)",
] as const;

export const Route = createFileRoute("/aktywny-maluch")({
  head: () => ({
    meta: seo(
      "Aktywny Maluch | Żłobek Misie Tulisie Gniezno",
      "Informacje o realizowanym zadaniu i dofinansowaniu w żłobku Misie Tulisie w Gnieźnie.",
    ),
  }),
  component: AktywnyMaluch,
});

function AktywnyMaluch() {
  return (
    <>
      <PageIntro
        eyebrow="Aktywny Maluch"
        title="Aktywny Maluch"
        lead="Strona przedstawia informacje o realizowanym zadaniu i dofinansowaniu."
      />
      <section className="container-site pb-8 md:pb-12">
        <div className="max-w-3xl">
          <article className="border-t border-border py-12 md:py-16">
            <h2 className="font-display text-3xl md:text-4xl">
              Zakres zadania
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Adaptacja tj. dokumentacja projektowa, dostosowanie pomieszczeń do
              potrzeb dzieci, zakup i montaż wyposażenia, zakup pomocy
              dydaktycznych, wyposażenie placu zabaw.
            </p>
          </article>
          <article className="border-t border-border py-12 md:py-16">
            <h2 className="font-display text-3xl md:text-4xl">
              Grupy docelowe
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              dzieci do ukończenia roku szkolnego, w którym dziecko ukończy 3
              rok życia lub dłużej zgodnie z ustawą z dnia 4 lutego 2011 r. o
              opiece nad dziećmi w wieku do lat 3; rodzice; opiekunowie
            </p>
          </article>
          <article className="border-t border-border py-12 md:py-16">
            <h2 className="font-display text-3xl md:text-4xl">Cel zadania</h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              utworzenie 65 miejsc opieki w Żłobku oraz dofinansowanie
              funkcjonowania tych miejsc w okresie pierwszych 36 miesięcy
            </p>
          </article>
          <article className="border-t border-border py-12 md:py-16">
            <h2 className="font-display text-3xl md:text-4xl">
              Wartość zadania i dofinansowanie
            </h2>
            <p className="mt-8 text-sm tracking-wide text-muted-foreground">
              Wartość zadania
            </p>
            <p className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              898 350,00 zł
            </p>
            <p className="mt-10 text-lg leading-relaxed text-muted-foreground">
              {/* Tablica trzyma dokładnie jedną spację po przecinku. */}
              {[
                "Wartość dofinansowania – środki z FERS: ",
                <span
                  key="kwota"
                  className="mt-3 block font-display text-4xl leading-none text-foreground md:text-5xl"
                >
                  826 650,00 zł,
                </span>,
                " pochodzące z następujących źródeł:",
              ]}
            </p>
            <ol className="mt-6 list-decimal space-y-4 pl-6 text-lg leading-relaxed text-muted-foreground">
              {zrodla.map((zrodlo) => (
                <li key={zrodlo}>{zrodlo}</li>
              ))}
            </ol>
          </article>
        </div>
      </section>
      <section className="bg-white">
        <div className="container-site py-14 md:py-20">
          <p className="text-sm tracking-wide text-foreground">
            #FunduszeUE #FunduszeEuropejskie
          </p>
          <ul className="mt-10 flex flex-wrap items-center gap-x-12 gap-y-10">
            {znaki.map((znak) => (
              <li key={znak.alt}>
                <img
                  src={znak.src}
                  alt={znak.alt}
                  width={znak.width}
                  height={znak.height}
                  className="h-auto w-auto max-h-24 max-w-full md:max-h-28 lg:max-h-32"
                />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
