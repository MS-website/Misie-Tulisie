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
  "Środki europejskie (BSE) – 665\u00a0647,48 zł (82,52 % dofinansowania)",
  "Środki dofinansowania w formie współfinansowania krajowego środków europejskich (BP) – 141\u00a0002,42 zł (17,48 % dofinansowania)",
] as const;

export const Route = createFileRoute("/aktywny-maluch")({
  head: () =>
    seo(
      "Aktywny Maluch | Żłobek Misie Tulisie Gniezno",
      "Informacje o realizowanym zadaniu i dofinansowaniu w żłobku Misie Tulisie w Gnieźnie.",
      "/aktywny-maluch",
    ),
  component: AktywnyMaluch,
});

function AktywnyMaluch() {
  return (
    <>
      <PageIntro
        className="subpage-intro"
        eyebrow="Aktywny Maluch"
        title="Aktywny Maluch"
        lead="Strona przedstawia informacje o realizowanym zadaniu i dofinansowaniu"
      />

      <section className="container-site min-w-0 pb-16 md:pb-24">
        <div className="min-w-0">
          <h2 className="font-display text-4xl leading-tight md:text-5xl">
            Zakres zadania
          </h2>
          <div className="mt-3 h-px w-14 bg-honey/50" aria-hidden="true" />
          <p className="mt-8 w-full max-w-none text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed">
            Adaptacja tj. dokumentacja projektowa, dostosowanie pomieszczeń do
            potrzeb dzieci, zakup i montaż wyposażenia, zakup pomocy
            dydaktycznych, wyposażenie placu zabaw.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl space-y-16 md:mt-20 md:space-y-20 lg:mt-24 lg:max-w-none lg:space-y-24">
          <div className="min-w-0 space-y-16 md:space-y-20 lg:grid lg:grid-cols-2 lg:gap-x-16 lg:space-y-0 xl:gap-x-24">
            <div className="min-w-0">
              <h2 className="font-display text-3xl leading-tight md:text-4xl">
                Grupy docelowe
              </h2>
              <div className="mt-3 h-px w-14 bg-honey/50" aria-hidden="true" />
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed">
                Dzieci do ukończenia roku szkolnego, w którym dziecko ukończy 3
                rok życia lub dłużej zgodnie z ustawą z dnia 4 lutego 2011 r. o
                opiece nad dziećmi w wieku do lat 3; rodzice; opiekunowie
              </p>
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-3xl leading-tight md:text-4xl">
                Cel zadania
              </h2>
              <div className="mt-3 h-px w-14 bg-honey/50" aria-hidden="true" />
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed">
                Utworzenie 65 miejsc opieki w Żłobku oraz dofinansowanie
                funkcjonowania tych miejsc w okresie pierwszych 36 miesięcy
              </p>
            </div>
          </div>

          <div className="min-w-0 border-t border-border/80 pt-16 md:pt-20">
            <h2 className="font-display text-4xl leading-tight md:text-5xl">
              Wartość zadania i dofinansowanie
            </h2>

            <div className="mt-12 flex min-w-0 md:mt-14">
              <div
                className="w-1.5 shrink-0 rounded-l-sm bg-sky-500/75 md:w-2"
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1 space-y-4 bg-gradient-to-r from-sky-100/55 via-sky-100/25 to-transparent px-5 py-5 text-base leading-relaxed text-foreground md:space-y-5 md:px-8 md:py-6 md:text-lg">
                <p className="min-w-0 break-words">
                  <strong className="font-semibold">Wartość zadania:</strong>{" "}
                  898 350,00 zł
                </p>
                <p className="min-w-0 break-words">
                  <strong className="font-semibold">
                    Wartość dofinansowania – środki z FERS:
                  </strong>{" "}
                  826 650,00 zł
                </p>
              </div>
            </div>

            <p className="mt-12 text-lg leading-relaxed text-muted-foreground md:mt-14 md:text-xl">
              pochodzące z następujących źródeł:
            </p>
            <ol className="mt-6 list-decimal space-y-5 pl-6 text-lg leading-relaxed text-muted-foreground md:space-y-6 md:pl-8 md:text-xl">
              {zrodla.map((zrodlo) => (
                <li key={zrodlo} className="min-w-0 max-w-none pl-1">
                  {zrodlo}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
      <section>
        <div className="container-site pb-14 pt-2 md:pb-20 md:pt-2">
          <p className="text-center text-sm tracking-wide text-foreground xl:text-left">
            #FunduszeUE #FunduszeEuropejskie
          </p>
          <ul className="mt-10 flex flex-col items-center gap-y-10 xl:flex-row xl:flex-wrap xl:items-center xl:justify-start xl:gap-x-12">
            {znaki.map((znak) => (
              <li key={znak.alt} className="flex justify-center">
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
