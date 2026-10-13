import { useState } from "react";
import galeria3 from "@/assets/galeria-3.jpg";
import wyprawkaPdfPrzycisk from "@/assets/wyprawka-pdf-przycisk.png";
import { Eyebrow, Photo, Reveal, RevealStaggerList } from "./ui";
import { cn } from "@/lib/utils";

const SECTION_NAV = [
  { id: "oplaty", label: "Opłaty i dofinansowania" },
  { id: "plan-dnia", label: "Plan dnia" },
  { id: "wyprawka", label: "Wyprawka" },
] as const;

const FEES = [
  { label: "Czesne w żłobku", amount: "0 zł" },
  { label: "Wpisowe", amount: "0 zł" },
  { label: "Wyżywienie", amount: "25 zł/dzień" },
  { label: "Koszt diety indywidualnej", amount: "27 zł/dzień" },
];

const DAY_PLAN: [string, string][] = [
  ["7:30 – 8:00", "Zaczynamy dzień w Misiach Tulisiach"],
  ["8:00 – 8:30", "Śniadanko"],
  ["8:30 -9:30", "Zajęcia grupowe"],
  [
    "9:30 – 10:45",
    "Wyjście na plac zabaw (w okresie zimowym w zależności od pogody)",
  ],
  ["10:45 – 11:00", "Mycie rączek"],
  ["11:00-11:30", "Zupka"],
  ["11:30 – 13:30", "Leżakowanie."],
  ["13:30 – 14:00", "Obiadek."],
  ["14:00 – 15:30", "Mycie ząbków i następnie wspólne zabawy grupowe"],
  ["15:30 – 16:00", "Podwieczorek"],
  ["16:00 – 17:30", "Luźne zabawy , czytanki , oczekiwanie na rodziców J"],
];

const WYPRAWKA_ITEMS = [
  "Pościel + prześcieradło do leżaczka o wymiarach 132,5 x 59.",
  "Pampersy (podpisane opakowanie).",
  "Mokre chusteczki (podpisane opakowanie).",
  "Śliniaczek gumowy lub plastikowy z korytkiem.",
  "Ubranka na zmianę , w tym skarpetki, body, bluzeczki, spodnie(najlepiej dresowe lub leginsy).",
  "Kubeczek (jeżeli dziecko nie pije jeszcze ze standardowego kubka).",
  "Krem na odparzenia dla niemowląt(może być też sudocrem).",
  "Ulubiona przytulanka do spania, jeżeli dziecku ułatwia zaśnięcie – bardzo mile widziana.",
  "Rolka ręczników papierowych (raz na 3 miesiące).",
  "Zestaw do mycia ząbków (kubeczek, pasta, szczoteczka).",
];

const AKTYWNIE_FAQ: [string, string][] = [
  [
    "Kto może skorzystać ze świadczenia „Aktywnie w żłobku”?",
    "Treść odpowiedzi do uzupełnienia przez placówkę (materiały ZUS / gov.pl).",
  ],
  [
    "Komu nie przysługuje dofinansowanie w ramach programu „Aktywny Rodzic”?",
    "Treść odpowiedzi do uzupełnienia przez placówkę.",
  ],
  [
    "Jaka jest wysokość świadczenia „Aktywnie w żłobku”?",
    "Treść odpowiedzi do uzupełnienia przez placówkę.",
  ],
  [
    "Jak wypłacane jest świadczenie?",
    "Treść odpowiedzi do uzupełnienia przez placówkę.",
  ],
  [
    "Gdzie i jak złożyć wniosek?",
    "Treść odpowiedzi do uzupełnienia przez placówkę.",
  ],
];

function SectionNav() {
  return (
    <nav
      aria-label="Spis treści strony"
      className="sticky top-20 z-40 border-y border-border/70 bg-background/92 backdrop-blur-md"
    >
      <div className="container-site flex gap-1 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTION_NAV.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className="shrink-0 rounded-full border border-border/80 px-4 py-2 text-sm text-foreground/85 transition-colors hover:border-honey/40 hover:text-foreground"
          >
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}

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
    <RevealStaggerList
      className="mt-10 divide-y divide-border/70 border-y border-border/70"
      stagger={520}
    >
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
    </RevealStaggerList>
  );
}

export function ParentsPageSections() {
  return (
    <>
      <SectionNav />

      <section
        id="oplaty"
        className="scroll-mt-[7.75rem] border-b border-border/60 bg-background py-20 md:py-28"
      >
        <div className="container-site min-w-0">
          <Reveal>
            <Eyebrow>Opłaty i dofinansowania</Eyebrow>
            <h2 className="font-display max-w-3xl text-4xl md:text-5xl lg:text-6xl">
              Przejrzyste informacje o kosztach
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Poniżej znajdziesz najważniejsze kwoty oraz informacje o
              programach, z których mogą skorzystać rodzice zapisujący dziecko
              do Misiów Tulisi.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:gap-10">
            <Reveal className="lg:col-span-7">
              <div className="grid gap-px overflow-hidden rounded-md border border-border/80 bg-border/80 sm:grid-cols-2">
                {FEES.map(({ label, amount }) => (
                  <div
                    key={label}
                    className="bg-card px-6 py-8 md:px-8 md:py-10"
                  >
                    <p className="text-sm font-medium tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="font-display mt-3 text-4xl text-foreground md:text-5xl">
                      {amount}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
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
            <Reveal className="min-w-0 lg:col-span-5" delay={80}>
              <Photo
                src={galeria3}
                alt="Dzieci przy stole podczas posiłku w żłobku"
                className="aspect-[4/5] max-w-full lg:ml-auto lg:max-w-md"
              />
            </Reveal>
          </div>

          <div className="mt-20 space-y-16 md:mt-24 md:space-y-20">
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
        className="scroll-mt-[7.75rem] bg-[oklch(0.97_0.014_88)] py-20 md:py-28"
      >
        <div className="container-site min-w-0">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal className="lg:col-span-4">
              <Eyebrow>Plan dnia</Eyebrow>
              <h2 className="font-display text-4xl md:text-5xl">
                Rytm dnia w Misiu Tulisiach
              </h2>
              <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
                Przewidywalny plan pomaga dzieciom czuć się bezpiecznie, a
                rodzicom — wiedzieć, czego można się spodziewać.
              </p>
            </Reveal>
            <ol className="relative min-w-0 lg:col-span-7 lg:col-start-6">
              <div
                className="absolute top-2 bottom-2 left-[4.5rem] hidden w-px bg-border md:left-[5.5rem] md:block"
                aria-hidden="true"
              />
              {DAY_PLAN.map(([time, title], i) => (
                <Reveal key={time} delay={i * 40}>
                  <li className="grid grid-cols-[5.5rem_1fr] gap-4 border-t border-border/70 py-6 md:grid-cols-[7rem_1fr] md:gap-8 md:py-7">
                    <time
                      dateTime={time.replace(/\s/g, "")}
                      className="font-display text-lg leading-tight text-[oklch(0.58_0.07_48)] md:text-xl"
                    >
                      {time}
                    </time>
                    <p className="text-base leading-relaxed text-foreground md:text-lg">
                      {title}
                    </p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section
        id="wyprawka"
        className="scroll-mt-[7.75rem] border-t border-border/60 py-20 md:py-28"
      >
        <div className="container-site min-w-0">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="min-w-0 lg:col-span-7">
              <Reveal>
                <Eyebrow>Wyprawka</Eyebrow>
                <h2 className="font-display text-4xl md:text-5xl">
                  Lista rzeczy do żłobka
                </h2>
              </Reveal>
              <Reveal delay={60}>
                <WyprawkaList />
                <p className="mt-8 text-base leading-relaxed md:text-lg">
                  <strong className="font-semibold text-foreground">
                    Prosimy aby wszystkie rzeczy były podpisane na specjalnych
                    naklejanych etykietkach bądź markerem.
                  </strong>
                </p>
                <WyprawkaPdfDownload className="mt-8" />
              </Reveal>
            </div>
            <div
              className="min-w-0 aspect-[4/5] max-w-full rounded-md border border-dashed border-border/70 bg-cream/35 lg:col-span-5 lg:sticky lg:top-36 lg:max-w-md lg:justify-self-end"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>
    </>
  );
}

export function ParentsPageIntro() {
  return (
    <section className="container-site pt-40 pb-10 md:pt-52 md:pb-14">
      <Reveal>
        <Eyebrow>Dla rodziców</Eyebrow>
        <h1 className="font-display max-w-4xl text-5xl md:text-7xl lg:text-8xl">
          Wszystko, co warto wiedzieć
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl">
          Opłaty, dofinansowania, plan dnia i wyprawka — zebraliśmy informacje,
          które pomagają spokojnie zaplanować pierwsze tygodnie w żłobku.
        </p>
      </Reveal>
    </section>
  );
}
