import { useState } from "react";
import oplatyInfografika from "@/assets/oplaty-infografika.png";
import wyzywienieGrupa from "@/assets/wyzywienie-grupa.jpg";
import planDniaMisie from "@/assets/plan-dnia-misie-tulisie.png";
import rytmDniaMisiePrzytulenie from "@/assets/rytm-dnia-misie-przytulenie.png";
import wyprawkaPdfPrzycisk from "@/assets/wyprawka-pdf-przycisk.png";
import { Eyebrow, Photo, Reveal } from "./ui";
import { cn } from "@/lib/utils";

const WYPRAWKA_ITEMS = [
  "Pościel + prześcieradło do leżaczka o wymiarach 132,5 x 59",
  "Pampersy (podpisane opakowanie)",
  "Mokre chusteczki (podpisane opakowanie)",
  "Śliniaczek gumowy lub plastikowy z korytkiem",
  "Ubranka na zmianę , w tym skarpetki, body, bluzeczki, spodnie (najlepiej dresowe lub leginsy)",
  "Kubeczek (jeśli dziecko nie pije jeszcze ze standardowego kubka)",
  "Krem na odparzenia dla niemowląt (może być też Sudocrem)",
  "Ulubiona przytulanka do spania, jeżeli dziecku ułatwia zaśnięcie – bardzo mile widziana",
  "Rolka ręczników papierowych (raz na 3 miesiące)",
  "Zestaw do mycia ząbków (kubeczek, pasta, szczoteczka)",
];

const AKTYWNIE_FAQ: [string, string][] = [
  [
    "Kto może skorzystać ze świadczenia „Aktywnie w żłobku”?",
    "Rodzice i opiekunowie dzieci uczęszczających do żłobka, klubu dziecięcego lub objętych opieką dziennego opiekuna. Świadczenie przysługuje niezależnie od dochodu rodziny.",
  ],
  [
    "Komu nie przysługuje świadczenie?",
    "Świadczenie nie przysługuje osobom korzystającym ze świadczenia „Aktywnie w domu” lub „Aktywni rodzice w pracy” na to samo dziecko w tym samym miesiącu.",
  ],
  [
    "Jaka jest wysokość świadczenia „Aktywnie w żłobku”?",
    "Do 1500 zł miesięcznie na dziecko lub do 1900 zł w przypadku dziecka z odpowiednim orzeczeniem o niepełnosprawności. Świadczenie nie obejmuje kosztów wyżywienia.",
  ],
  [
    "Jak wypłacane jest świadczenie?",
    "ZUS przekazuje pieniądze bezpośrednio na rachunek podmiotu prowadzącego żłobek lub zapewniającego opiekę. Rodzic pokrywa ewentualną różnicę w opłacie oraz koszt wyżywienia.",
  ],
  [
    "Gdzie złożyć wniosek?",
    "Wniosek można złożyć elektronicznie przez PUE ZUS (eZUS), aplikację mZUS, bankowość elektroniczną lub portal Emp@tia. Warto zrobić to w ciągu 2 miesięcy od rozpoczęcia opieki, aby uzyskać świadczenie od pierwszego dnia pobytu dziecka.",
  ],
];

function Accordion({
  items,
  className,
}: {
  items: [string, string][];
  className?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={className}>
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div key={q} className="border-t border-border/80 last:border-b">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-4 py-5 text-left"
            >
              <span className="text-base leading-snug md:text-lg">{q}</span>
              <span className="relative mt-1.5 h-3.5 w-3.5 shrink-0">
                <span className="absolute top-1/2 left-0 h-px w-3.5 bg-foreground" />
                <span
                  className={cn(
                    "absolute top-1/2 left-0 h-px w-3.5 bg-foreground transition-transform duration-500",
                    isOpen ? "rotate-0" : "rotate-90",
                  )}
                />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-700 ease-[var(--ease-calm)]",
                isOpen
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <p className="overflow-hidden pr-6 pb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                {a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WyprawkaPdfDownload({ className }: { className?: string }) {
  return (
    <a
      href="/wyprawka-misie-tulisie.pdf"
      download="wyprawka-misie-tulisie.pdf"
      aria-label="Pobierz wyprawkę w PDF"
      className={cn(
        "inline-block max-w-full rounded-full transition-transform duration-500 ease-[var(--ease-calm)] hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <img
        src={wyprawkaPdfPrzycisk}
        alt=""
        width={1024}
        height={395}
        className="h-auto w-full max-w-[min(100%,18rem)] sm:max-w-[22rem]"
        decoding="async"
      />
    </a>
  );
}

function WyprawkaList() {
  return (
    <ul className="mt-10 divide-y divide-border/70 border-y border-border/70">
      {WYPRAWKA_ITEMS.map((item) => (
        <li key={item} className="flex gap-4 py-5 md:gap-5">
          <span
            className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-honey/75"
            aria-hidden="true"
          />
          <span className="min-w-0 text-base leading-relaxed text-foreground md:text-lg">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ParentsPageSections() {
  return (
    <>
      <section
        id="oplaty"
        className="scroll-mt-24 border-b border-border/60 bg-background py-20 md:py-28"
      >
        <div className="container-site min-w-0">
          <Reveal>
            <Eyebrow>Opłaty i dofinansowania</Eyebrow>
            <h2 className="font-display max-w-3xl text-4xl md:text-5xl lg:text-6xl">
              Przejrzyste informacje o kosztach
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Tu znajdziesz najważniejsze kwoty oraz informacje o programach,
              <br />
              z których mogą korzystać rodzice zapisujący dzieci do Misi Tulisi.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
            <Reveal className="min-w-0 lg:col-span-7">
              <img
                src={oplatyInfografika}
                alt="Czesne w żłobku 0 zł, wpisowe 0 zł, wyżywienie 25 zł/dzień, koszt diety indywidualnej 27 zł/dzień"
                className="h-auto w-full"
              />
            </Reveal>
            <Reveal
              className="flex min-w-0 flex-col gap-4 lg:col-span-5 lg:row-start-1 lg:self-start"
              delay={80}
            >
              <Photo
                src={wyzywienieGrupa}
                alt="Dzieci przy wspólnym posiłku w żłobku"
                fit="contain"
                className="aspect-[2/1] w-full"
              />
            </Reveal>
            <Reveal className="min-w-0 lg:col-span-12">
              <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Czesne wynosi 0 zł miesięcznie w przypadku skorzystania przez
                rodziców z obydwóch przysługujących dofinansowań.
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Kwota ta obejmuje śniadanie, zupkę, drugie danie oraz
                podwieczorek. Opłatę naliczamy z kosztem miesiąca na podstawie
                obecności malucha w placówce. Misie Tulisie korzystają z
                cateringu dla dzieci Jemyzielone.pl – stąd mamy pewność, że
                Nasze pociechy otrzymują świeże i zdrowe posiłki każdego dnia.
              </p>
            </Reveal>
          </div>

          <div className="mt-10 space-y-16 md:mt-12 md:space-y-20">
            <Reveal>
              <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
                <div className="min-w-0 lg:col-span-6">
                  <h3 className="font-display text-3xl md:text-4xl">
                    Rządowy program „Aktywny Rodzic”
                  </h3>
                  <div className="mt-4 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                    <p>
                      To program który jest elementem reformy systemu wspierania
                      opieki nad dziećmi do lat 3, wprowadził trzy nowe
                      świadczenia dla rodziców:
                    </p>
                    <ul className="list-disc space-y-2 pl-5">
                      <li>„Aktywnie w żłobku”,</li>
                      <li>„Aktywnie w domu”,</li>
                      <li>„Aktywni rodzice w pracy” (tzw. babciowe).</li>
                    </ul>
                    <p>
                      W Misiach Tulisiach istnieje możliwość skorzystania ze
                      świadczenia „Aktywnie w żłobku” w wysokości 1500 zł
                      miesięcznie, które wspiera rodziców w finansowaniu opieki
                      nad maluchami. Celem programu jest ułatwienie rodzicom
                      powrotu do pracy przy równoczesnym zatroszczeniu się o
                      najlepszą opiekę dla dziecka.
                    </p>
                  </div>
                </div>
                <div className="min-w-0 rounded-md border border-border/70 bg-cream/80 p-6 md:p-8 lg:col-span-6">
                  <p className="text-sm font-semibold tracking-wide text-foreground">
                    „Aktywnie w żłobku” — pytania i odpowiedzi
                  </p>
                  <Accordion items={AKTYWNIE_FAQ} className="mt-4" />
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="max-w-3xl border-l-2 border-[oklch(0.72_0.06_145)] pl-6 md:pl-8">
                <h3 className="font-display text-3xl md:text-4xl">
                  Program „Aktywny Maluch 2022-2029”
                </h3>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                  Ponadto, w Misiach Tulisiach każdemu z rodziców przysługuje
                  dofinansowanie w ramach programu Aktywny Maluch 2022-2029,
                  które finansuje każde obsadzone miejsce w placówce w wysokości
                  836 zł miesięcznie.
                </p>
              </div>
            </Reveal>

            <Reveal>
              <p className="max-w-3xl text-lg leading-relaxed text-foreground md:text-xl">
                Rodzice mogą korzystać z obu dofinansować jednocześnie.
                Skorzystanie przez rodziców z obu świadczeń sprawia, że ich
                maluch ma możliwość skorzystać z opieki w prywatnym żłobku bez
                żadnych kosztów.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="plan-dnia"
        className="scroll-mt-24 bg-[oklch(0.97_0.014_88)] py-20 md:py-28"
      >
        <div className="container-site min-w-0">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-16">
            <Reveal className="lg:col-span-4">
              <Eyebrow>Plan dnia</Eyebrow>
              <h2 className="font-display text-4xl md:text-5xl">
                Rytm dnia w Misiu Tulisiach
              </h2>
              <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
                Przewidywalny plan pomaga dzieciom czuć się bezpiecznie, a
                rodzice zawsze wiedzą co aktualnie robi ich pociecha.
              </p>
              <Photo
                src={rytmDniaMisiePrzytulenie}
                alt="Przytulone misie — ilustracja do sekcji o rytmie dnia"
                fit="contain"
                className="mt-8 w-full max-w-xs"
              />
            </Reveal>
            <Reveal className="min-w-0 lg:col-span-7 lg:col-start-6" delay={80}>
              <Photo
                src={planDniaMisie}
                alt="Plan dnia w żłobku Misie Tulisie — godziny zajęć, posiłków i odpoczynku"
                fit="contain"
                className="mx-auto w-full max-w-md lg:mx-0 lg:max-w-xl"
              />
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="wyprawka"
        className="scroll-mt-24 border-t border-border/60 py-20 md:py-28"
      >
        <div className="container-site min-w-0">
          <Reveal className="max-w-none">
            <Eyebrow>Wyprawka</Eyebrow>
            <h2 className="font-display max-w-3xl text-4xl md:text-5xl">
              Lista rzeczy do żłobka
            </h2>
            <WyprawkaList />
            <p className="mt-8 max-w-3xl text-base leading-relaxed md:text-lg">
              <strong className="font-semibold text-foreground">
                Prosimy, aby wszystkie rzeczy były podpisane na specjalnych
                naklejanych etykietkach bądź markerem.
              </strong>
            </p>
            <WyprawkaPdfDownload className="mt-8" />
          </Reveal>
        </div>
      </section>
    </>
  );
}

export function ParentsPageIntro() {
  return (
    <section className="container-site pt-40 pb-10 md:pt-52 md:pb-14">
      <Reveal>
        <h1 className="font-display max-w-4xl text-5xl md:text-7xl lg:text-8xl">
          Wszystko,{" "}
          <span className="whitespace-nowrap">co warto wiedzieć</span>
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Opłaty, dofinansowania, plan dnia i wyprawka — zebraliśmy informacje,
          które pomagają spokojnie zaplanować pierwsze tygodnie w żłobku.
        </p>
      </Reveal>
    </section>
  );
}
