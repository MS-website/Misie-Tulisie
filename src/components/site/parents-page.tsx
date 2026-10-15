import { useEffect, useRef, useState, type CSSProperties } from "react";
import oplatyInfografika from "@/assets/oplaty-infografika.png";
import wyzywienieGrupa from "@/assets/wyzywienie-grupa.jpg";
import planDniaPokoj from "@/assets/plan-dnia-pokoj.jpg";
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
    <ul className="mt-8 divide-y divide-border/70 border-y border-border/70">
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

function HoneyRule({ className }: { className?: string }) {
  return (
    <span
      className={cn("block h-px w-[3cm] bg-honey", className)}
      aria-hidden="true"
    />
  );
}

function ParentsGreenRule({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "parents-green-rule-hit rounded-md flex shrink-0 items-stretch justify-center px-1.5",
        className,
      )}
      data-parents-accent-line="czesne-0"
      aria-hidden="true"
    >
      <span className="parents-green-rule-bar" />
    </div>
  );
}

type PlanDayIconId =
  | "start"
  | "bowl"
  | "wash"
  | "blocks"
  | "soup"
  | "play"
  | "plate"
  | "sleep"
  | "apple"
  | "book";

type PlanDayItem = {
  id: string;
  time: string;
  label: string;
  icon: PlanDayIconId;
  iconSrc?: string;
};

const DAY_PLAN: PlanDayItem[] = [
  {
    id: "start",
    time: "7:00–8:00",
    icon: "start",
    label: "Zaczynamy dzień w Misiach Tulisiach",
  },
  { id: "breakfast", time: "8:00–8:30", icon: "bowl", label: "Śniadanko" },
  {
    id: "wash-1",
    time: "8:30–9:00",
    icon: "wash",
    label: "Mycie rączek i ząbków",
  },
  {
    id: "group",
    time: "9:00–10:00",
    icon: "blocks",
    label: "Zajęcia grupowe",
  },
  { id: "soup", time: "10:00–10:30", icon: "soup", label: "Zupka" },
  {
    id: "wash-2",
    time: "10:30–11:00",
    icon: "wash",
    label: "Mycie rączek i ząbków",
  },
  {
    id: "playground",
    time: "11:00–12:30",
    icon: "play",
    label: "Wyjście na plac zabaw (w okresie zimowym uzależnione od pogody)",
  },
  { id: "lunch", time: "12:30–13:00", icon: "plate", label: "Obiadek" },
  {
    id: "wash-3",
    time: "13:00–13:30",
    icon: "wash",
    label: "Mycie rączek i ząbków",
  },
  { id: "nap", time: "13:30–15:00", icon: "sleep", label: "Leżakowanie" },
  {
    id: "snack",
    time: "15:00–15:30",
    icon: "apple",
    label: "Podwieczorek",
  },
  {
    id: "free",
    time: "15:30–17:00",
    icon: "book",
    label: "Wspólne zabawy, czytanki, oczekiwanie na rodziców",
  },
];

function PlanDayIconGlyph({ icon }: { icon: PlanDayIconId }) {
  const props = {
    viewBox: "0 0 32 32",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[1.35rem] w-[1.35rem] opacity-35 md:h-6 md:w-6",
    "aria-hidden": true as const,
  };
  if (icon === "start") {
    return (
      <svg {...props}>
        <path d="M6 22h20" />
        <path d="M9 22a7 7 0 0 1 14 0" />
        <path d="M16 7v3" />
      </svg>
    );
  }
  if (icon === "bowl") {
    return (
      <svg {...props}>
        <path d="M7 14h18" />
        <path d="M8.5 14c.6 6 3 9 7.5 9s6.9-3 7.5-9" />
      </svg>
    );
  }
  if (icon === "wash") {
    return (
      <svg {...props}>
        <path d="M9 8c1.6 2 1.6 3.8 0 6" />
        <path d="M14 22 22 13" />
        <path d="M21 11h4" />
      </svg>
    );
  }
  if (icon === "blocks") {
    return (
      <svg {...props}>
        <path d="M6.5 15.5h9v9h-9z" />
        <path d="M16.5 8.5h9v9h-9z" />
      </svg>
    );
  }
  if (icon === "soup") {
    return (
      <svg {...props}>
        <path d="M7 16h18" />
        <path d="M9 16c.5 5.5 2.6 8.5 7 8.5s6.5-3 7-8.5" />
      </svg>
    );
  }
  if (icon === "play") {
    return (
      <svg {...props}>
        <path d="M8 24V14" />
        <path d="M20 24V11" />
        <path d="M5 24h22" />
      </svg>
    );
  }
  if (icon === "plate") {
    return (
      <svg {...props}>
        <circle cx="15" cy="17" r="7" />
        <path d="M24 11v8" />
      </svg>
    );
  }
  if (icon === "sleep") {
    return (
      <svg {...props}>
        <path d="M23 9h3" />
        <path d="M15.5 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12Z" />
      </svg>
    );
  }
  if (icon === "apple") {
    return (
      <svg {...props}>
        <path d="M16 12.5c-3.8.2-6.5 3.2-6.5 7 0 3.4 2.4 5.8 6.5 5.8s6.5-2.4 6.5-5.8c0-3.8-2.7-6.8-6.5-7Z" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M6.5 9.5h19v13H6.5z" />
      <path d="M16 9.5v13" />
    </svg>
  );
}

function PlanDayIconSlot({ item }: { item: PlanDayItem }) {
  if (item.iconSrc) {
    return (
      <img
        src={item.iconSrc}
        alt=""
        width={48}
        height={48}
        className="h-full w-full object-contain"
        decoding="async"
        data-plan-day-icon={item.id}
      />
    );
  }
  return (
    <span
      className="plan-dnia-icon-slot"
      data-plan-day-icon={item.id}
      title="Miejsce na ikonę"
    >
      <PlanDayIconGlyph icon={item.icon} />
    </span>
  );
}

function PlanDayTimeline({ className }: { className?: string }) {
  const ref = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        el.classList.add("is-visible");
        io.disconnect();
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <ol
      ref={ref}
      className={cn("plan-dnia-timeline", className)}
      aria-label="Plan dnia"
    >
      {DAY_PLAN.map((item, index) => (
        <li
          key={item.id}
          className={cn(
            "plan-dnia-timeline-row",
            index % 2 === 0 && "plan-dnia-timeline-row-alt",
          )}
          style={{ "--plan-i": index } as CSSProperties}
        >
          <span className="plan-dnia-timeline-time">{item.time}</span>
          <span className="plan-dnia-timeline-rail" aria-hidden="true">
            <span className="plan-dnia-timeline-dot" />
          </span>
          <PlanDayIconSlot item={item} />
          <span className="plan-dnia-timeline-label">{item.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function ParentsPageSections() {
  return (
    <>
      <section
        id="oplaty"
        data-parents-layout="static-v2"
        className="scroll-mt-24 border-b border-border/60 bg-background pb-20 md:pb-28"
      >
        <div className="container-site min-w-0 pt-24 md:pt-28">
          <Reveal>
            <h1 className="font-display max-w-4xl text-5xl md:text-7xl lg:text-8xl">
              Wszystko,{" "}
              <span className="whitespace-nowrap">co warto wiedzieć</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:mt-8 md:text-xl">
              Opłaty, dofinansowania, plan dnia i wyprawka — zebraliśmy
              informacje, które pomagają spokojnie zaplanować pierwsze tygodnie
              w żłobku.
            </p>
            <HoneyRule className="mt-6 md:mt-8" />
          </Reveal>

          <div className="mt-10 md:mt-12">
          <Reveal>
            <h2 className="font-display max-w-3xl text-4xl md:text-5xl lg:text-6xl">
              Przejrzyste informacje o kosztach
            </h2>
            <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Tu znajdziesz najważniejsze informacje o opłatach oraz
              świadczeniach, które przysługują rodzicom chcącym zapisać dziecko
              do naszego żłobka.
            </p>
          </Reveal>

          <div className="mt-8 grid items-start gap-x-10 gap-y-10 lg:grid-cols-12 lg:gap-x-14">
            <div className="space-y-10 lg:col-span-5">
              <Reveal>
                <p className="eyebrow mb-5">Wyżywienie</p>
                <Photo
                  src={wyzywienieGrupa}
                  alt="Dzieci przy wspólnym posiłku w żłobku"
                  className="aspect-[3/2] w-full"
                />
              </Reveal>
              <Reveal className="space-y-10">
              <div>
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
              <div>
                <h3 className="font-display text-3xl md:text-4xl">
                  Program „Aktywny Maluch 2022-2029”
                </h3>
                <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                  Ponadto, w Misiach Tulisiach każdemu z rodziców przysługuje
                  dofinansowanie w ramach programu Aktywny Maluch 2022-2029,
                  które finansuje każde obsadzone miejsce w placówce w wysokości
                  836 zł miesięcznie.
                </p>
              </div>
            </Reveal>
            </div>
            <div className="space-y-10 lg:col-span-7">
            <Reveal delay={80}>
              <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Kwota za wyżywienie składa się na śniadanie, zupkę, obiad oraz
                podwieczorek. Opłatę pobieramy z końcem miesiąca na podstawie
                obecności malucha w placówce. Misie Tulisie korzystają z
                cateringu dla dzieci Jemyzielone.pl – stąd mamy pewność, że
                Nasze pociechy otrzymują świeże i zdrowe posiłki każdego dnia.
              </p>
              <img
                src={oplatyInfografika}
                alt="Czesne w żłobku 0 zł, wpisowe 0 zł, wyżywienie 25 zł za dzień, koszt diety indywidualnej 27 zł za dzień"
                className="mt-6 h-auto w-full"
              />
            </Reveal>
            <Reveal delay={80}>
              <div className="rounded-md border border-[oklch(0.62_0.14_248_/_26%)] bg-[oklch(0.68_0.13_248_/_9%)] p-6 md:p-8">
                <p className="text-sm font-semibold tracking-wide text-foreground">
                  „Aktywnie w żłobku” — pytania i odpowiedzi
                </p>
                <Accordion
                  items={AKTYWNIE_FAQ}
                  className="mt-4"
                  itemBorderClassName="border-[oklch(0.62_0.14_248_/_20%)]"
                />
              </div>
            </Reveal>
            <Reveal delay={80}>
              <div className="parents-czesne-callout">
                <ParentsGreenRule />
                <p className="parents-czesne-callout-text min-w-0 max-w-md flex-1 text-base leading-relaxed text-foreground md:text-lg">
                  Korzystając z obu przysługujących świadczeń, czesne w Misiach
                  Tulisiach wynosi 0 zł przez cały okres uczęszczania malucha do
                  żłobka.
                </p>
              </div>
            </Reveal>
            </div>
          </div>
          </div>
        </div>
      </section>

      <section
        id="plan-dnia"
        data-parents-plan-dnia="built-v1"
        className="plan-dnia-section scroll-mt-24 py-14 md:py-20 lg:py-24"
      >
        <div className="plan-dnia-section-bg" aria-hidden="true">
          <img
            src={planDniaPokoj}
            alt=""
            width={1024}
            height={576}
            className="h-full w-full object-cover object-center"
            decoding="async"
          />
        </div>
        <div className="container-site relative min-w-0">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
            <Reveal className="lg:col-span-5">
              <p className="eyebrow mb-6 text-[oklch(0.58_0.14_18)]">Plan dnia</p>
              <h2 className="font-display max-w-md text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
                Rytm dnia w Misiach Tulisiach
              </h2>
              <p className="mt-6 max-w-sm text-base leading-relaxed text-muted-foreground md:text-lg">
                Przewidywalny plan pomaga dzieciom czuć się bezpiecznie, a
                rodzice zawsze wiedzą, co aktualnie robi ich pociecha.
              </p>
            </Reveal>
            <Reveal delay={80} className="min-w-0 lg:col-span-7">
              <div className="plan-dnia-schedule-card">
                <PlanDayTimeline />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section
        id="wyprawka"
        className="scroll-mt-24 border-t border-border/60 py-20 md:py-28"
      >
        <div className="container-site min-w-0">
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-x-16">
            <Reveal className="lg:col-span-6">
              <Eyebrow>Wyprawka</Eyebrow>
              <h2 className="font-display max-w-xl text-4xl md:text-5xl">
                Lista rzeczy do żłobka
              </h2>
              <WyprawkaList />
              <p className="mt-8 max-w-xl text-base leading-relaxed md:text-lg">
                <strong className="font-semibold text-foreground">
                  Prosimy, aby wszystkie rzeczy były podpisane na specjalnych
                  naklejanych etykietkach bądź markerem.
                </strong>
              </p>
            </Reveal>
            <Reveal delay={80} className="lg:col-span-6">
              <HoneyRule className="mb-8 ml-auto" />
              <WyprawkaPhoto />
              <WyprawkaPdfDownload className="mx-auto mt-8 block w-fit" />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
