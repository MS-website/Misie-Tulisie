import { useEffect, useRef, useState, type CSSProperties } from "react";
import oplatyInfografika from "@/assets/oplaty-infografika.png";
import wyzywienieGrupa from "@/assets/wyzywienie-grupa.jpg";
import rytmDniaMisiePrzytulenie from "@/assets/rytm-dnia-misie-przytulenie.png";
import wyprawkaMisTorba from "@/assets/wyprawka-mis-torba.jpg";
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
  itemBorderClassName = "border-border/80",
}: {
  items: [string, string][];
  className?: string;
  itemBorderClassName?: string;
}) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className={className}>
      {items.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div
            key={q}
            className={cn("border-t last:border-b", itemBorderClassName)}
          >
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
    <ul className="mt-10 w-[calc(100%+1cm)] divide-y divide-border/70 border-y border-border/70">
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

function WyprawkaPhoto({ className }: { className?: string }) {
  return (
    <Photo
      src={wyprawkaMisTorba}
      alt="Wyprawka do żłobka w torbie: ubranka, pościel, kubeczek, pieluchy i akcesoria higieniczne"
      fit="cover"
      className={cn(
        "mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-md lg:mx-0 lg:max-w-none",
        className,
      )}
    />
  );
}

type DayIconName =
  | "sunrise"
  | "bowl"
  | "wash"
  | "blocks"
  | "soup"
  | "play"
  | "plate"
  | "sleep"
  | "apple"
  | "book";

const DAY_PLAN: { time: string; icon: DayIconName; label: string }[] = [
  { time: "7:00–8:00", icon: "sunrise", label: "Zaczynamy dzień w Misiach Tulisiach" },
  { time: "8:00–8:30", icon: "bowl", label: "Śniadanko" },
  { time: "8:30–9:00", icon: "wash", label: "Mycie rączek i ząbków" },
  { time: "9:00–10:00", icon: "blocks", label: "Zajęcia grupowe" },
  { time: "10:00–10:30", icon: "soup", label: "Zupka" },
  { time: "10:30–11:00", icon: "wash", label: "Mycie rączek i ząbków" },
  {
    time: "11:00–12:30",
    icon: "play",
    label: "Wyjście na plac zabaw (w okresie zimowym uzależnione od pogody)",
  },
  { time: "12:30–13:00", icon: "plate", label: "Obiadek" },
  { time: "13:00–13:30", icon: "wash", label: "Mycie rączek i ząbków" },
  { time: "13:30–15:00", icon: "sleep", label: "Leżakowanie" },
  { time: "15:00–15:30", icon: "apple", label: "Podwieczorek" },
  {
    time: "15:30–17:00",
    icon: "book",
    label: "Wspólne zabawy, czytanki, oczekiwanie na rodziców",
  },
];

function DayIcon({ name }: { name: DayIconName }) {
  const props = {
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
    className: "h-7 w-7 shrink-0",
  };
  if (name === "sunrise") {
    return (
      <svg {...props}>
        <path d="M6 22h20" />
        <path d="M9 22a7 7 0 0 1 14 0" />
        <path d="M16 7v3.5" />
        <path d="M8.5 11.5 11 14" />
        <path d="M23.5 11.5 21 14" />
      </svg>
    );
  }
  if (name === "bowl") {
    return (
      <svg {...props}>
        <path d="M7 14h18" />
        <path d="M8.5 14c.6 6 3 9 7.5 9s6.9-3 7.5-9" />
        <path d="M21 11c2.2.4 3.8 2 4.2 4.2" />
      </svg>
    );
  }
  if (name === "wash") {
    return (
      <svg {...props}>
        <path d="M9 7.5c1.8 2.4 1.8 4.2 0 6.4-1.8-2.2-1.8-4 0-6.4Z" />
        <path d="M14 22.5 23 12" />
        <path d="M21.2 10.2h4.2" />
        <path d="M21.6 12.2h3.4" />
        <path d="M22 14.2h2.6" />
      </svg>
    );
  }
  if (name === "blocks") {
    return (
      <svg {...props}>
        <path d="M6.5 15.5h9v9h-9z" />
        <path d="M16.5 8.5h9v9h-9z" />
        <path d="M16.5 13h9" />
        <path d="M21 8.5v9" />
      </svg>
    );
  }
  if (name === "soup") {
    return (
      <svg {...props}>
        <path d="M7 16h18" />
        <path d="M9 16c.5 5.5 2.6 8.5 7 8.5s6.5-3 7-8.5" />
        <path d="M12.5 12c.7-1.4-.2-2.6.4-4" />
        <path d="M18 12c.7-1.4-.2-2.6.4-4" />
      </svg>
    );
  }
  if (name === "play") {
    return (
      <svg {...props}>
        <path d="M8 24V15" />
        <path d="M8 15c-2.4.2-4 2-3.2 4.2h6.4C12.2 17 10.4 15.2 8 15Z" />
        <path d="M20 24V11" />
        <path d="M20 11c-3.2.2-5.4 2.6-4.2 5.6h8.4C24.8 13.6 23.2 11.2 20 11Z" />
        <path d="M5 24h22" />
      </svg>
    );
  }
  if (name === "plate") {
    return (
      <svg {...props}>
        <circle cx="15" cy="17" r="7.5" />
        <path d="M11.5 17.5c1.2-2.2 5.8-2.2 7 0" />
        <path d="M24 11v8" />
        <path d="M24 11c1.4 0 2.4 1 2.4 2.2S25.4 15.4 24 15.4" />
      </svg>
    );
  }
  if (name === "sleep") {
    return (
      <svg {...props}>
        <circle cx="11" cy="12.5" r="2" />
        <circle cx="19.5" cy="11.5" r="2.3" />
        <circle cx="15.5" cy="18" r="6.2" />
        <path d="M13 18.2c.7.7 1.5.7 2.1 0" />
        <path d="M17.2 18c.6.7 1.4.7 2 0" />
        <path d="M23 8h3.2" />
        <path d="M24.6 8 23 10.4h3.2" />
      </svg>
    );
  }
  if (name === "apple") {
    return (
      <svg {...props}>
        <path d="M16 12.5c-3.8.2-6.5 3.2-6.5 7 0 3.4 2.4 5.8 6.5 5.8s6.5-2.4 6.5-5.8c0-3.8-2.7-6.8-6.5-7Z" />
        <path d="M16 12.5c.2-2.4 1.4-4 3.6-4.6" />
        <path d="M16.4 12.2c1.2-1.6 2.8-2 4-1.6" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M6.5 9.5h8.2c1.3 0 2.3.6 2.8 1.6.5-1 1.5-1.6 2.8-1.6H27v13.2h-6.7c-1.2 0-2.2.5-2.8 1.3-.6-.8-1.6-1.3-2.8-1.3H6.5V9.5Z" />
      <path d="M17.5 11.1v13" />
    </svg>
  );
}

function DayRhythm({ className }: { className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        el.classList.add("is-visible");
        io.disconnect();
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <ol ref={ref} className={cn("day-rhythm", className)} aria-label="Plan dnia">
      {DAY_PLAN.map((item, index) => {
        const tone = index % 2 === 0 ? "day-rhythm-olive" : "day-rhythm-clay";
        return (
          <li
            key={item.time}
            className="day-rhythm-row"
            style={{ "--day-i": index } as CSSProperties}
          >
            <span className="day-rhythm-time">{item.time}</span>
            <span className="day-rhythm-rail" aria-hidden="true">
              <span className={cn("day-rhythm-dot", tone)} />
            </span>
            <span className={cn("day-rhythm-icon", tone)} aria-hidden="true">
              <DayIcon name={item.icon} />
            </span>
            <span className="day-rhythm-label">{item.label}</span>
          </li>
        );
      })}
    </ol>
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
              Tu znajdziesz najważniejsze informacje o opłatach oraz
              świadczeniach, które przysługują rodzicom chcącym zapisać dziecko
              do naszego żłobka.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-8 lg:grid-cols-12 lg:items-start lg:gap-10">
            <Reveal className="min-w-0 lg:col-span-7">
              <img
                src={oplatyInfografika}
                alt="Czesne w żłobku 0 zł, wpisowe 0 zł, wyżywienie 22 zł za dzień stawki, kosmetyki i artykuły higieniczne 0 zł miesięcznie"
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
                Korzystając z obu przysługujących świadczeń, czesne w Misiach
                Tulisiach wynosi 0 zł przez cały okres uczęszczania malucha do
                żłobka.
              </p>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Kwota za wyżywienie składa się na śniadanie, zupkę, obiad oraz
                podwieczorek. Opłatę pobieramy z końcem miesiąca na podstawie
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
                      To rządowy program, który jest elementem reformy systemu
                      wspierania opieki nad dziećmi do lat 3, wprowadzający trzy
                      nowe świadczenia dla rodziców:
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
                <div className="min-w-0 rounded-md border border-[oklch(0.62_0.14_248_/_26%)] bg-[oklch(0.68_0.13_248_/_9%)] p-6 md:p-8 lg:col-span-6">
                  <p className="text-sm font-semibold tracking-wide text-foreground">
                    „Aktywnie w żłobku” — pytania i odpowiedzi
                  </p>
                  <Accordion
                    items={AKTYWNIE_FAQ}
                    className="mt-4"
                    itemBorderClassName="border-[oklch(0.62_0.14_248_/_20%)]"
                  />
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
                Rodzice mogą korzystać z obu form dofinansowania jednocześnie.
                Dzięki temu ich maluch może uczęszczać do prywatnego żłobka bez
                ponoszenia żadnych kosztów.
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
                Rytm dnia w Misiach Tulisiach
              </h2>
              <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
                Przewidywalny plan pomaga dzieciom czuć się bezpiecznie, a
                rodzice zawsze wiedzą, co aktualnie robi ich pociecha.
              </p>
              <Photo
                src={rytmDniaMisiePrzytulenie}
                alt="Przytulone misie — ilustracja do sekcji o rytmie dnia"
                fit="contain"
                className="mt-8 w-full max-w-xs"
              />
            </Reveal>
            <DayRhythm className="min-w-0 lg:col-span-7 lg:col-start-6" />
          </div>
        </div>
      </section>

      <section
        id="wyprawka"
        className="scroll-mt-24 border-t border-border/60 py-20 md:py-28"
      >
        <div className="container-site min-w-0">
          <Reveal>
            <Eyebrow>Wyprawka</Eyebrow>
            <h2 className="font-display max-w-3xl text-4xl md:text-5xl">
              Lista rzeczy do żłobka
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-10 lg:mt-12 lg:grid-cols-12 lg:items-start lg:gap-12">
            <div className="min-w-0 overflow-visible lg:col-span-6 xl:col-span-5">
              <Reveal>
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
            <div className="min-w-0 lg:col-span-6 lg:col-start-7 xl:col-span-6 xl:col-start-7">
              <Reveal delay={80}>
                <WyprawkaPhoto />
              </Reveal>
            </div>
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
