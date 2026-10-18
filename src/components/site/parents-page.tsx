import { useEffect, useRef, useState, type CSSProperties } from "react";
import oplatyInfografika from "@/assets/oplaty-infografika.png";
import wyzywienieGrupa from "@/assets/wyzywienie-grupa.jpg";
import planDniaPokoj from "@/assets/plan-dnia-pokoj.jpg";
import planDniaSlonko from "@/assets/plan-dnia-slonko.png";
import planDniaSniadanko from "@/assets/plan-dnia-sniadanko.png";
import planDniaMycie from "@/assets/plan-dnia-mycie.png";
import planDniaZupka from "@/assets/plan-dnia-zupka.png";
import planDniaPlacZabaw from "@/assets/plan-dnia-plac-zabaw.png";
import planDniaKlocki from "@/assets/plan-dnia-klocki.png";
import planDniaObiadek from "@/assets/plan-dnia-obiadek.png";
import planDniaKsiazka from "@/assets/plan-dnia-ksiazka.png";
import planDniaLezakowanie from "@/assets/plan-dnia-lezakowanie.png";
import planDniaPodwieczorek from "@/assets/plan-dnia-podwieczorek.png";
import wyprawkaMisTorba from "@/assets/wyprawka-mis-torba.jpg";
import wyprawkaPdfPrzycisk from "@/assets/wyprawka-pdf-przycisk.png";
import { ParentsTuneSurface } from "@/components/site/ParentsLayoutTune";
import { UkladText } from "@/components/site/UkladText";
import { Eyebrow, Photo, Reveal } from "./ui";
import { cn } from "@/lib/utils";

const UKLAD_OPLATY_WYZYWIENIE = '[data-uklad-text="oplaty-wyzywienie"]';
const UKLAD_OPLATY_MALUCH_TEKST = '[data-uklad-text="oplaty-maluch-tekst"]';
const UKLAD_OPLATY_MALUCH_TYTUL = '[data-uklad-text="oplaty-maluch-tytul"]';

const WYPRAWKA_ITEMS = [
  "Pościel + prześcieradło do leżaczka o wymiarach 132,5 x 59",
  "Pampersy (podpisane opakowanie)",
  "Mokre chusteczki (podpisane opakowanie)",
  "Śliniaczek gumowy lub plastikowy z korytkiem",
  "Ubranka na zmianę , w tym skarpetki, body, bluzeczki, spodnie (najlepiej dresowe lub legginsy)",
  "Kubeczek (jeśli dziecko nie pije jeszcze ze standardowego kubka)",
  "Krem na odparzenia dla niemowląt (może być też Sudocrem)",
  "Ulubiona przytulanka do spania, jeżeli dziecku ułatwia zaśnięcie – bardzo mile widziana",
  "Zestaw do mycia ząbków (kubeczek, pasta, szczoteczka)",
];

const AKTYWNIE_FAQ: [string, string][] = [
  [
    "Kto może skorzystać ze świadczenia „Aktywnie w żłobku”?",
    "Rodzice i opiekunowie dzieci uczęszczających do żłobka, klubu dziecięcego lub objętych opieką dziennego opiekuna. Świadczenie przysługuje niezależnie od dochodu rodziny.",
  ],
  [
    "Komu nie przysługuje świadczenie?",
    "Świadczenie nie przysługuje osobom korzystającym ze świadczenia „Aktywnie w\u00a0domu” lub „Aktywni rodzice w pracy” na to samo dziecko w tym samym miesiącu.",
  ],
  [
    "Jaka jest wysokość świadczenia „Aktywnie w żłobku”?",
    "Do 1500 zł miesięcznie na dziecko lub do 1900 zł w przypadku dziecka z\u00a0odpowiednim orzeczeniem o niepełnosprawności. Świadczenie nie obejmuje kosztów wyżywienia.",
  ],
  [
    "Jak wypłacane jest świadczenie?",
    "ZUS przekazuje świadczenie bezpośrednio na rachunek podmiotu zapewniającego opiekę, po uprzednim złożeniu przez rodzica wniosku „Aktywnie w żłobku”.",
  ],
  [
    "Gdzie złożyć wniosek?",
    "Wniosek można złożyć elektronicznie przez PUE ZUS (eZUS), aplikację mZUS, bankowość elektroniczną lub portal Emp@tia. W razie problemów z wypełnieniem wniosku chętnie pomożemy.",
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
  const [open, setOpen] = useState(0);
  const choose = (index: number) => {
    setOpen((current) => (current === index ? 0 : index));
  };
  return (
    <div className={cn("grid items-start", className)}>
      <div className="col-start-1 row-start-1">
        {items.map(([q, a], i) => {
          const isOpen = open === i;
          return (
            <div
              key={q}
              className={cn("border-t last:border-b", itemBorderClassName)}
            >
              <button
                type="button"
                onClick={() => choose(i)}
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
                <div className="min-h-0 overflow-hidden">
                  <p className="pr-6 pb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {a}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div
        className="invisible col-start-1 row-start-1"
        aria-hidden="true"
      >
        {items.map(([q]) => (
          <div
            key={q}
            className={cn("border-t last:border-b", itemBorderClassName)}
          >
            <div className="flex w-full items-start justify-between gap-4 py-5 text-left">
              <span className="text-base leading-snug md:text-lg">{q}</span>
              <span className="mt-1.5 h-3.5 w-3.5 shrink-0" />
            </div>
          </div>
        ))}
        <div className="grid">
          {items.map(([, a]) => (
            <p
              key={a}
              className="col-start-1 row-start-1 pr-6 pb-5 text-sm leading-relaxed md:text-base"
            >
              {a}
            </p>
          ))}
        </div>
      </div>
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
      className={cn("parents-honey-rule-hit block w-max", className)}
      data-parents-accent-line="oplaty-intro"
      aria-hidden="true"
    >
      <span className="block h-px w-[3cm] bg-honey" />
    </span>
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
    iconSrc: planDniaSlonko,
    label: "Zaczynamy dzień w Misiach Tulisiach",
  },
  {
    id: "breakfast",
    time: "8:00–8:30",
    icon: "bowl",
    iconSrc: planDniaSniadanko,
    label: "Śniadanko",
  },
  {
    id: "wash-1",
    time: "8:30–9:00",
    icon: "wash",
    iconSrc: planDniaMycie,
    label: "Mycie rączek i ząbków",
  },
  {
    id: "group",
    time: "9:00–10:00",
    icon: "blocks",
    iconSrc: planDniaKlocki,
    label: "Zajęcia grupowe",
  },
  {
    id: "soup",
    time: "10:00–10:30",
    icon: "soup",
    iconSrc: planDniaZupka,
    label: "Zupka",
  },
  {
    id: "wash-2",
    time: "10:30–11:00",
    icon: "wash",
    iconSrc: planDniaMycie,
    label: "Mycie rączek i ząbków",
  },
  {
    id: "playground",
    time: "11:00–12:30",
    icon: "play",
    iconSrc: planDniaPlacZabaw,
    label: "Wyjście na plac zabaw (w okresie zimowym uzależnione od pogody)",
  },
  {
    id: "lunch",
    time: "12:30–13:00",
    icon: "plate",
    iconSrc: planDniaObiadek,
    label: "Obiadek",
  },
  {
    id: "wash-3",
    time: "13:00–13:30",
    icon: "wash",
    iconSrc: planDniaMycie,
    label: "Mycie rączek i ząbków",
  },
  {
    id: "nap",
    time: "13:30–15:00",
    icon: "sleep",
    iconSrc: planDniaLezakowanie,
    label: "Leżakowanie",
  },
  {
    id: "snack",
    time: "15:00–15:30",
    icon: "apple",
    iconSrc: planDniaPodwieczorek,
    label: "Podwieczorek",
  },
  {
    id: "free",
    time: "15:30–17:00",
    icon: "book",
    iconSrc: planDniaKsiazka,
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
        className="plan-dnia-icon-image"
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
        data-uklad-section="oplaty"
        data-parents-layout="static-v2"
        className="scroll-mt-24 border-b border-border/60 bg-background pb-12 md:pb-16"
      >
        <div className="container-site min-w-0 pt-24 md:pt-28">
          <Reveal className="parents-oplaty-intro space-y-4 md:space-y-5">
            <ParentsTuneSurface id="oplaty-naglowek">
              <h1 className="parents-oplaty-intro-title font-display text-xl leading-[1.2] md:text-3xl lg:text-4xl">
                Opłaty, dofinansowania, plan dnia i wyprawka – zebraliśmy
                <br />
                informacje, które pomagają spokojnie zaplanować pierwsze tygodnie w
                żłobku
              </h1>
            </ParentsTuneSurface>
            <ParentsTuneSurface id="oplaty-wstep">
              <p className="max-w-[38rem] text-lg leading-relaxed text-muted-foreground">
                Tu znajdziesz najważniejsze informacje o opłatach oraz świadczeniach,
                <br />
                które przysługują rodzicom chcącym zapisać dziecko do naszego żłobka.
              </p>
            </ParentsTuneSurface>
            <ParentsTuneSurface id="oplaty-kreska">
              <HoneyRule />
            </ParentsTuneSurface>
          </Reveal>

          <div className="parents-wyzywienie-band mt-6 md:mt-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-14">
            <Reveal className="lg:col-span-5">
              <ParentsTuneSurface id="oplaty-wyzywienie-eyebrow">
                <p className="eyebrow mb-3 md:mb-4">Wyżywienie</p>
              </ParentsTuneSurface>
              <ParentsTuneSurface id="oplaty-wyzywienie-foto">
                <Photo
                  src={wyzywienieGrupa}
                  alt="Dzieci przy wspólnym posiłku w żłobku"
                  className="aspect-[3/2] w-full"
                />
              </ParentsTuneSurface>
            </Reveal>
            <Reveal
              delay={80}
              className="parents-wyzywienie-copy mt-6 w-full lg:col-span-7 lg:mt-0 lg:pt-2"
            >
              <div className="parents-wyzywienie-stack">
                <ParentsTuneSurface id="oplaty-tekst-wyzywienie" className="w-full">
                  <UkladText
                    as="p"
                    selector={UKLAD_OPLATY_WYZYWIENIE}
                    data-uklad-text="oplaty-wyzywienie"
                    className="parents-wyzywienie-prose w-full text-base leading-[1.65] text-muted-foreground md:text-lg md:leading-[1.7]"
                  >
                    Kwota za wyżywienie składa się na śniadanie, zupkę, obiad oraz
                    <br />
                    podwieczorek. Opłatę pobieramy z końcem miesiąca na podstawie
                    <br />
                    obecności malucha w placówce. Misie Tulisie korzystają z cateringu
                    <br />
                    dla dzieci Jemyzielone.pl – stąd mamy pewność, że Nasze pociechy
                    <br />
                    otrzymują świeże i zdrowe posiłki każdego dnia.
                  </UkladText>
                </ParentsTuneSurface>
                <ParentsTuneSurface id="oplaty-infografika" className="parents-wyzywienie-infografika">
                  <img
                    src={oplatyInfografika}
                    alt="Czesne w żłobku 0 zł, wpisowe 0 zł, wyżywienie 24 zł za dzień, koszt diety indywidualnej 27 zł za dzień"
                    className="parents-oplaty-card h-auto w-full"
                  />
                </ParentsTuneSurface>
              </div>
            </Reveal>
          </div>

          <div className="parents-programy mt-14 grid items-start gap-x-10 gap-y-10 lg:mt-16 lg:grid-cols-12 lg:gap-x-14">
            <Reveal className="space-y-10 lg:col-span-5">
              <ParentsTuneSurface id="oplaty-aktywny-rodzic-tytul">
                <h3 className="font-display text-3xl md:text-4xl">
                  Rządowy program „Aktywny Rodzic”
                </h3>
              </ParentsTuneSurface>
              <ParentsTuneSurface id="oplaty-aktywny-rodzic-wstep">
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  To rządowy program, który jest elementem reformy systemu
                  wspierania opieki nad dziećmi do lat 3, wprowadzający trzy
                  nowe świadczenia dla rodziców:
                </p>
              </ParentsTuneSurface>
              <ParentsTuneSurface id="oplaty-aktywny-rodzic-lista">
                <ul className="list-disc space-y-2 pl-5 text-base leading-relaxed text-muted-foreground md:text-lg">
                  <li>„Aktywnie w żłobku”,</li>
                  <li>„Aktywnie w domu”,</li>
                  <li>„Aktywni rodzice w pracy” (tzw. babciowe).</li>
                </ul>
              </ParentsTuneSurface>
              <ParentsTuneSurface id="oplaty-aktywny-rodzic-akapit">
                <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                  W Misiach Tulisiach istnieje możliwość skorzystania ze
                  świadczenia „Aktywnie w żłobku” w wysokości 1500 zł
                  miesięcznie, które wspiera rodziców w finansowaniu opieki
                  nad maluchami. Celem programu jest ułatwienie rodzicom
                  powrotu do pracy przy równoczesnym zatroszczeniu się o
                  najlepszą opiekę dla dziecka.
                </p>
              </ParentsTuneSurface>
              <ParentsTuneSurface id="oplaty-maluch-tytul">
                <UkladText
                  as="h3"
                  selector={UKLAD_OPLATY_MALUCH_TYTUL}
                  data-uklad-text="oplaty-maluch-tytul"
                  className="font-display text-3xl md:text-4xl"
                >
                  Program „Aktywny Maluch{" "}
                  <span className="whitespace-nowrap">2022-2029</span>”
                </UkladText>
              </ParentsTuneSurface>
              <ParentsTuneSurface id="oplaty-maluch-tekst">
                <UkladText
                  as="p"
                  selector={UKLAD_OPLATY_MALUCH_TEKST}
                  data-uklad-text="oplaty-maluch-tekst"
                  className="text-base leading-relaxed text-muted-foreground md:text-lg"
                >
                  Ponadto, w naszym żłobku każdemu z rodziców przysługuje
                  dofinansowanie w ramach programu Aktywny Maluch 2022-2029,
                  które finansuje każde obsadzone miejsce w placówce w wysokości
                  836 zł miesięcznie.
                </UkladText>
              </ParentsTuneSurface>
            </Reveal>
            <div className="space-y-10 lg:col-span-7">
              <Reveal delay={80}>
                <ParentsTuneSurface id="oplaty-faq">
                  <div className="w-full rounded-md border border-[oklch(0.62_0.14_248_/_26%)] bg-[oklch(0.68_0.13_248_/_9%)] p-6 md:p-8 lg:max-w-[40rem]">
                    <p className="text-2xl font-semibold tracking-wide text-foreground">
                      „Aktywnie w żłobku” — pytania i odpowiedzi
                    </p>
                    <Accordion
                      items={AKTYWNIE_FAQ}
                      className="mt-4"
                      itemBorderClassName="border-[oklch(0.62_0.14_248_/_20%)]"
                    />
                  </div>
                </ParentsTuneSurface>
              </Reveal>
              <Reveal delay={80} className="lg:pt-4">
                <ParentsTuneSurface id="oplaty-czesne">
                  <div className="parents-czesne-callout">
                    <ParentsGreenRule />
                    <p className="parents-czesne-callout-text min-w-0 max-w-lg flex-1 text-base leading-relaxed text-foreground md:text-lg">
                      Korzystając z obu przysługujących świadczeń, czesne w naszej
                      placówce wynosi 0 zł przez cały okres uczęszczania malucha do żłobka.
                    </p>
                  </div>
                </ParentsTuneSurface>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section
        id="plan-dnia"
        data-uklad-section="plan-dnia"
        data-parents-plan-dnia="built-v1"
        className="plan-dnia-section scroll-mt-24 mt-6 pt-8 pb-12 md:mt-8 md:pt-12 md:pb-16 lg:mt-10 lg:pt-14 lg:pb-20"
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
          <div className="grid items-start gap-10 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-14">
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
        data-uklad-section="wyprawka"
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
              <WyprawkaPhoto />
              <WyprawkaPdfDownload className="mx-auto mt-8 block w-fit" />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
