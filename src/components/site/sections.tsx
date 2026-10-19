import { useState } from "react";
import { Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import storyZabawaKlockami from "@/assets/story-zabawa-klockami.jpg";
import play from "@/assets/play.jpg";
import int1 from "@/assets/interior-1.jpg";
import int2 from "@/assets/interior-2.jpg";
import galeria1 from "@/assets/galeria-1.jpg";
import galeria2 from "@/assets/galeria-2.jpg";
import galeria3 from "@/assets/galeria-3.jpg";
import galeria4 from "@/assets/galeria-4.jpg";
import galeria5 from "@/assets/galeria-5.jpg";
import galeria6 from "@/assets/galeria-6.jpg";
import { submitContact } from "@/lib/forms";
import { contact } from "@/lib/site";
import { ButtonLink, Eyebrow, Photo, Reveal } from "./ui";
import { cn } from "@/lib/utils";

/* ---------- HERO ---------- */
export function Hero() {
  return (
    <section className="relative pt-28 md:pt-32">
      <div className="container-site grid items-end gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="pb-4 lg:col-span-6 lg:pb-24">
          <Reveal>
            <Eyebrow>Żłobek w Gnieźnie</Eyebrow>
            <h1 className="font-display text-[3.2rem] sm:text-7xl xl:text-[6.5rem]">
              Miejsce, w którym małe kroki mają <em className="text-honey">wielkie</em> znaczenie.
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
              Misie Tulisie to bezpieczna, ciepła przestrzeń, w której dzieci mogą rozwijać się we
              własnym tempie, a rodzice zyskują spokój i pewność, że ich dziecko jest pod dobrą
              opieką.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <ButtonLink to="/kontakt" hash="wizyta">Umów wizytę</ButtonLink>
              <ButtonLink to="/o-nas" variant="text">
                Poznaj Misie Tulisie →
              </ButtonLink>
            </div>
          </Reveal>
        </div>
        <Reveal className="lg:col-span-6" delay={100}>
          <Photo
            src={hero}
            alt="Opiekunka bawi się z dzieckiem drewnianymi klockami"
            className="aspect-[4/5] lg:aspect-[9/11]"
            eager
          />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- TRUST BAR ---------- */
const trust = [
  ["Bezpieczna przestrzeń", "Przemyślane otoczenie stworzone z myślą o najmłodszych."],
  ["Indywidualne podejście", "Każde dziecko ma swój rytm, potrzeby i temperament."],
  ["Rozwój przez zabawę", "Codzienna aktywność wspiera rozwój poznawczy, ruchowy i społeczny."],
  ["Spokój rodzica", "Dbamy o dobrą komunikację i poczucie bezpieczeństwa całej rodziny."],
];
export function TrustBar() {
  return (
    <section className="container-site py-20 md:py-28">
      <div className="grid border-t border-border sm:grid-cols-2 lg:grid-cols-4">
        {trust.map(([t, d], i) => (
          <Reveal
            key={t}
            delay={i * 80}
            className={cn(
              "border-b border-border py-8 sm:pr-8 lg:border-b-0 lg:py-10",
              i > 0 && "lg:border-l lg:pl-8",
              i % 2 === 1 && "sm:border-l sm:pl-8 lg:pl-8",
            )}
          >
            <h3 className="text-base font-semibold">{t}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{d}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- STORY ---------- */
export function Story({ cta = true }: { cta?: boolean }) {
  return (
    <section className="bg-secondary/70 py-24 md:py-36">
      <div className="container-site grid items-center gap-14 lg:grid-cols-12">
        <Reveal className="lg:col-span-5">
          <Photo
            src={storyZabawaKlockami}
            alt="Maluch bawi się drewnianymi klockami w jasnej sali żłobkowej"
            className="aspect-[4/5]"
          />
        </Reveal>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <Eyebrow>Dlaczego Misie Tulisie</Eyebrow>
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl">
              Żłobek to coś więcej niż opieka.
            </h2>
            <div className="mt-10 space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                To pierwsze miejsce, w którym dziecko zaczyna odkrywać świat poza domem. Pierwsze
                relacje, pierwsze małe sukcesy, pierwsze samodzielne decyzje.
              </p>
              <p>
                Dlatego tworzymy przestrzeń, w której dziecko może czuć się bezpiecznie, być
                zauważone i rozwijać się we własnym tempie.
              </p>
            </div>
            {cta && (
              <ButtonLink to="/o-nas" variant="ghost" className="mt-10">
                Poznaj nas bliżej
              </ButtonLink>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------- VALUES ---------- */
const values = [
  ["Bezpieczeństwo", "Tworzymy przestrzeń, w której dziecko może czuć się spokojnie i pewnie."],
  ["Bliskość", "Relacja z dzieckiem jest dla nas podstawą dobrej opieki."],
  ["Rozwój", "Wspieramy ciekawość, samodzielność i naturalną potrzebę poznawania świata."],
  ["Zaufanie", "Rodzic jest naszym partnerem. Chcemy, aby zawsze wiedział, co dzieje się z jego dzieckiem."],
];
export function Values() {
  return (
    <section className="container-site py-24 md:py-36">
      <Reveal>
        <Eyebrow>Wartości</Eyebrow>
        <h2 className="font-display max-w-3xl text-5xl md:text-7xl">Na tym zależy nam najbardziej.</h2>
      </Reveal>
      <div className="mt-16 grid gap-x-16 md:grid-cols-2">
        {values.map(([t, d], i) => (
          <Reveal key={t} delay={i * 80} className="group flex gap-8 border-t border-border py-10">
            <span className="font-display text-5xl text-honey/70 transition-colors duration-700 group-hover:text-honey md:text-6xl">
              0{i + 1}
            </span>
            <div className="pt-2">
              <h3 className="text-xl font-semibold">{t}</h3>
              <p className="mt-3 max-w-sm leading-relaxed text-muted-foreground">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- DAY TIMELINE ---------- */
const day = [
  ["07:00", "Dzień dobry", "Spokojne przywitanie i czas na swobodną zabawę."],
  ["09:00", "Śniadanie", ""],
  ["10:00", "Odkrywamy", "Zajęcia, zabawy i aktywności dopasowane do wieku dzieci."],
  ["12:00", "Obiad i odpoczynek", ""],
  ["14:30", "Popołudniowa zabawa", ""],
  ["16:00+", "Spokojne zakończenie dnia", ""],
];
export function DayTimeline() {
  return (
    <section className="bg-primary py-24 text-primary-foreground md:py-36">
      <div className="container-site grid gap-16 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <p className="eyebrow mb-6">Rytm dnia</p>
              <h2 className="font-display text-5xl md:text-6xl">Dzień w Misiach Tulisiach</h2>
              <p className="mt-6 max-w-xs leading-relaxed text-primary-foreground/65">
                Przewidywalny rytm daje dzieciom poczucie bezpieczeństwa.
              </p>
            </Reveal>
          </div>
        </div>
        <ol className="lg:col-span-7 lg:col-start-6">
          {day.map(([time, t, d], i) => (
            <Reveal key={time} delay={i * 60}>
              <li className="grid grid-cols-[6rem_1fr] gap-6 border-t border-primary-foreground/15 py-8 md:grid-cols-[9rem_1fr]">
                <span className="font-display text-3xl text-honey md:text-4xl">{time}</span>
                <div>
                  <h3 className="text-lg font-medium md:text-xl">{t}</h3>
                  {d && <p className="mt-2 leading-relaxed text-primary-foreground/65">{d}</p>}
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- DEVELOPMENT ---------- */
const areas = [
  ["Rozwój sensoryczny", "Dotyk, dźwięk, faktura i ruch — dziecko poznaje świat wszystkimi zmysłami."],
  ["Rozwój ruchowy", "Raczkowanie, chodzenie, wspinanie się. Bezpieczna przestrzeń na pierwsze wyzwania."],
  ["Rozwój społeczny", "Pierwsze przyjaźnie, wspólna zabawa i nauka bycia razem z innymi."],
  ["Rozwój poznawczy", "Ciekawość, pytania i odkrycia, które budują fundament dalszej nauki."],
];
export function Development() {
  const [active, setActive] = useState(0);
  return (
    <section className="container-site py-24 md:py-36">
      <div className="grid items-start gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal>
            <Eyebrow>Rozwój przez zabawę</Eyebrow>
            <h2 className="font-display text-5xl md:text-7xl">
              Małe dzieci.
              <br />
              Wielka ciekawość.
            </h2>
          </Reveal>
          <ul className="mt-14">
            {areas.map(([t, d], i) => (
              <li key={t} className="border-t border-border last:border-b">
                <button
                  onMouseEnter={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className="flex w-full items-baseline gap-6 py-6 text-left"
                >
                  <span
                    className={cn(
                      "h-px w-6 shrink-0 translate-y-[-4px] bg-honey transition-all duration-700",
                      active === i ? "w-12" : "opacity-40",
                    )}
                  />
                  <span className="flex-1">
                    <span
                      className={cn(
                        "block text-xl transition-colors duration-500 md:text-2xl",
                        active === i ? "text-foreground" : "text-foreground/45",
                      )}
                    >
                      {t}
                    </span>
                    <span
                      className={cn(
                        "grid transition-all duration-700 ease-[var(--ease-calm)]",
                        active === i ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <span className="overflow-hidden leading-relaxed text-muted-foreground">{d}</span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <Reveal className="lg:col-span-5 lg:col-start-8" delay={120}>
          <Photo src={play} alt="Dziecko odkrywa tacę sensoryczną z drewnianymi łyżkami" className="aspect-[4/5]" />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- SPACE / GALLERY ---------- */
export const galleryImages = [
  {
    src: galeria1,
    alt: "Jasna sala żłobkowa ze stolikami, niebieskimi szafkami i dużym oknem",
  },
  {
    src: galeria2,
    alt: "Przestronna sala z drewnianymi meblami i kącikiem do zabawy",
  },
  {
    src: galeria3,
    alt: "Sala zabaw z oknami, dywanem i drewnianym wyposażeniem",
  },
  {
    src: galeria4,
    alt: "Sala na zielonej ścianie ze stolikami, szafkami i domkiem do zabawy",
  },
  {
    src: galeria5,
    alt: "Wnętrze sali z kącikiem zabaw i naturalnym światłem z okien",
  },
  {
    src: galeria6,
    alt: "Przytulna sala żłobkowa z drewnianymi meblami i miejscem do zabawy",
  },
];
export function Space({ full = false }: { full?: boolean }) {
  const imgs = full ? galleryImages : galleryImages.slice(0, 4);
  return (
    <section className="py-24 md:py-36">
      <div className="container-site">
        <Reveal className="grid gap-8 md:grid-cols-2 md:items-end">
          <div>
            <Eyebrow>Przestrzeń</Eyebrow>
            <h2 className="font-display text-5xl md:text-7xl">Każdy szczegół ma znaczenie.</h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-muted-foreground md:justify-self-end">
          Tworzymy przestrzeń bezpieczną, funkcjonalną i przyjazną najmłodszym.
          </p>
        </Reveal>
        <div className="-mx-4 mt-16 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:-mx-6 md:-mx-10 md:gap-4 lg:grid-cols-3">
          {imgs.map((im, i) => (
            <Reveal key={im.src} delay={(i % 3) * 100} className="h-full w-full">
              <Photo
                src={im.src}
                alt={im.alt}
                zoomOut
                className="aspect-video h-full w-full"
              />
            </Reveal>
          ))}
        </div>
        {!full && (
          <div className="mt-10">
            <ButtonLink to="/galeria" variant="text">Zobacz galerię →</ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}

/* ---------- TEAM ---------- */
export function Team() {
  return (
    <section className="bg-secondary/70 py-24 md:py-36">
      <div className="container-site">
        <Reveal className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Eyebrow>Zespół</Eyebrow>
            <h2 className="font-display text-5xl md:text-7xl">Najważniejsi są ludzie.</h2>
          </div>
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7 lg:pt-12">
            <p>
              Za każdym bezpiecznym dniem dziecka stoi człowiek — uważny, cierpliwy i zaangażowany.
            </p>
            <p>
              Nasz zespół tworzą osoby, które nie tylko posiadają odpowiednie przygotowanie, ale
              przede wszystkim potrafią budować z dziećmi prawdziwe relacje.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const faq = [
  [
    "Jak wygląda proces adaptacji?",
    "Adaptację planujemy indywidualnie, razem z rodzicem, w tempie dopasowanym do dziecka. Szczegóły chętnie omówimy podczas wizyty w żłobku.",
  ],
  [
    "Co dziecko powinno przynieść pierwszego dnia?",
    "Przed rozpoczęciem przekażemy rodzicom wszystkie potrzebne informacje. Jeśli masz pytania już teraz — zadzwoń lub napisz do nas.",
  ],
  [
    "Jak wygląda dzień w żłobku?",
    "Dzień ma spokojny, przewidywalny rytm: przywitanie i swobodna zabawa, śniadanie, zajęcia dopasowane do wieku, obiad i odpoczynek, popołudniowa zabawa i spokojne zakończenie dnia.",
  ],
  [
    "Jak wygląda kontakt z rodzicami?",
    "Rodzic jest dla nas partnerem. Zależy nam, aby zawsze wiedział, jak minął dzień jego dziecka. Formy kontaktu omówimy podczas spotkania.",
  ],
  [
    "Jak dbacie o bezpieczeństwo dzieci?",
    "Przestrzeń żłobka została zaprojektowana z myślą o najmłodszych, a dzieci przez cały czas pozostają pod opieką naszego zespołu. Zapraszamy, aby zobaczyć ją na miejscu.",
  ],
  [
    "Jak wyglądają posiłki?",
    "Dzieci jedzą posiłki o stałych porach w ciągu dnia. O szczegóły dotyczące jadłospisu zapytaj nas bezpośrednio.",
  ],
  ["Jakie są godziny otwarcia?", `Żłobek jest otwarty w godzinach ${contact.hours}.`],
];
export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div>
      {faq.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div key={q} className="border-t border-border last:border-b">
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-6 py-6 text-left"
            >
              <span className="text-lg md:text-xl">{q}</span>
              <span className="relative h-4 w-4 shrink-0">
                <span className="absolute top-1/2 left-0 h-px w-4 bg-foreground" />
                <span
                  className={cn(
                    "absolute top-1/2 left-0 h-px w-4 bg-foreground transition-transform duration-500",
                    isOpen ? "rotate-0" : "rotate-90",
                  )}
                />
              </span>
            </button>
            <div
              className={cn(
                "grid transition-all duration-700 ease-[var(--ease-calm)]",
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <p className="overflow-hidden pr-10 leading-relaxed text-muted-foreground">
                <span className="block pb-6">{a}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- RECRUITMENT RULES ---------- */
export function RecruitmentRules() {
  return (
    <section className="container-site pb-24 md:pb-32">
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <Eyebrow>Zasady rekrutacji</Eyebrow>
          <h2 className="font-display text-4xl md:text-5xl">
            Przez cały rok,
            <br />
            w wieku od 1 do 3 lat
          </h2>
        </Reveal>
        <Reveal className="recruitment-rules-copy space-y-5 text-lg leading-relaxed text-muted-foreground lg:col-span-7 lg:col-start-6" delay={100}>
          <p>
            Rekrutacja do żłobka Misie Tulisie trwa przez cały rok i mogą w niej brać udział dzieci
            w wieku od 1 roku życia do 3 lat. Dziecko można zapisać w dowolnym miesiącu. Jeśli{" "}
            <br />
            w{"\u00a0"}naszym żłobku pojawi się wolne miejsce, maluch będzie mógł rozpocząć
            uczęszczanie do placówki.
          </p>
          <p>
            Abyśmy mogli przyjąć dziecko do grona naszych pociech, potrzebujemy zaakceptowania przez
            Państwa naszego regulaminu i podpisania umowy. Umowa na świadczenie usług
            opiekuńczo-wychowawczych i edukacyjnych zawierana jest na czas nieokreślony,{" "}
            <br />z{"\u00a0"}1-miesięcznym okresem wypowiedzenia. Umowa określa opłaty, obowiązki żłobka i rodzica,
            warunki rozwiązania umowy i inne niezbędne informacje.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- RECRUITMENT STEPS ---------- */
const recruitmentSteps = [
  {
    title: "Pobranie karty zgłoszenia",
    body: (
      <>
        <p>
          Pierwszym etapem rekrutacji jest pobranie{" "}
          <a
            href="/karta-zgloszenia-dziecka.pdf"
            download="karta-zgloszenia-dziecka.pdf"
            className="font-medium text-foreground underline decoration-honey/60 underline-offset-4 transition-colors hover:text-honey"
          >
            karty zgłoszenia dziecka
          </a>
          .
        </p>
        <p className="@container recruitment-mail-paragraph">
          W Misiach Tulisiach rekrutację prowadzimy przez cały rok. Jeżeli chcesz zapisać swoje
          dziecko do naszego żłobka, skontaktuj się z nami lub wypełnij kartę zgłoszeniową dostępną
          powyżej i prześlij{"\u00a0"}ją{"\u00a0"}na{" "}
          <span className="mail-same-line">
            adres e-mail:{"\u00a0"}
            <a
              href="mailto:zlobekmisietulisie@onet.pl"
              className="font-medium text-foreground underline decoration-honey/60 underline-offset-4 transition-colors hover:text-honey"
            >
              zlobekmisietulisie@onet.pl
            </a>
          </span>
        </p>
      </>
    ),
  },
  {
    title: "Kontakt ze strony placówki",
    body: (
      <p>
        Po otrzymaniu uzupełnionej karty placówka zapozna się z nią i skontaktuje się
        z Państwem, aby omówić dalsze kroki rekrutacji.
      </p>
    ),
  },
  {
    title: "Spotkanie w placówce",
    body: (
      <>
        <p>
          Podczas spotkania oprowadzimy Państwa po naszej placówce, przedstawimy szczegóły oferty
          oraz odpowiemy na pytania dotyczące opieki, adaptacji i organizacji dnia.
        </p>
        <p>
          Jeżeli zdecydują się Państwo zapisać dziecko do naszej placówki, umówimy kolejne spotkanie
          celem podpisania umowy.
        </p>
      </>
    ),
  },
];

export function RecruitmentSteps() {
  return (
    <section className="bg-secondary/70 py-24 md:py-32">
      <div className="container-site">
        <Reveal>
          <Eyebrow>Krok po kroku</Eyebrow>
          <h2 className="font-display max-w-3xl text-5xl md:text-7xl">Jak przebiega rekrutacja?</h2>
        </Reveal>
        <ol className="mt-16 grid gap-6 lg:grid-cols-3">
          {recruitmentSteps.map((step, i) => (
            <li key={step.title} className="flex">
              <Reveal delay={i * 100} className="flex w-full">
                <div className="flex w-full flex-col rounded-2xl border border-honey/25 bg-card p-8 md:p-10">
                  <span className="block text-center font-display text-3xl text-honey md:text-4xl">Krok {i + 1}</span>
                  <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                  <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground">{step.body}</div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------- ADAPTATION ---------- */
export function Adaptation() {
  return (
    <section className="container-site py-24 md:py-32">
      <div className="grid gap-10 lg:grid-cols-12">
        <Reveal className="lg:col-span-4">
          <Eyebrow>Adaptacja</Eyebrow>
          <h2 className="font-display text-4xl md:text-5xl">Adaptacja w nowym środowisku</h2>
        </Reveal>
        <Reveal className="space-y-5 text-lg leading-relaxed text-muted-foreground lg:col-span-7 lg:col-start-6" delay={100}>
          <p>
            Przywiązujemy dużą wagę do tego, by wszystkie pociechy czuły się u nas kochane
            i bezpieczne. Dlatego niezwykle ważna jest dla nas bliskościowa adaptacja, która pozwala
            maluchowi zaakceptować rozstanie z rodzicami.
          </p>
          <p>
            Pierwszego dnia dziecko spędza około godziny w sali z rodzicem, najlepiej z samego rana,
            kiedy jest najciszej i najspokojniej – to ułatwia zapoznanie się z otoczeniem. Drugiego
            dnia równieź spotykamy się z samego rana i próbujemy pierwszego pożegnania ale tylko
            wtedy, gdy maluch jest na to gotowy. Kolejne dni ustalane są na bieżąco na podstawie
            obserwacji maluszka – proces adaptacji w przypadku każdego dziecka dostosowany jest do
            jego indywidualnych potrzeb. Rodzicom zawsze polecamy, aby w pierwszych dniach żłobkowej
            aktywności ich pociechy byli oni gotowi na wcześniejszy odbiór dziecka z placówki.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- RECRUITMENT ---------- */
export function Recruitment() {
  return (
    <section className="container-site pb-24 md:pb-36">
      <Reveal className="grid min-h-0 overflow-hidden rounded-md bg-cream md:grid-cols-2">
        <div className="min-h-0 p-10 md:p-16 lg:p-20">
          <Eyebrow>Rekrutacja</Eyebrow>
          <h2 className="font-display text-4xl md:text-6xl">
            Zastanawiasz się, czy Misie Tulisie są dla Was?
          </h2>
          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
            Najlepiej przyjechać, zobaczyć nasze wnętrza, poznać nas i porozmawiać.
          </p>
          <div className="mt-10">
            <ButtonLink to="/kontakt">Umów wizytę</ButtonLink>
          </div>
        </div>
        <Photo
          src={int1}
          alt="Przytulny kącik zabaw z namiotem tipi, drewnianymi zabawkami i miękkimi poduszkami"
          className="aspect-[4/3] min-h-0 overflow-hidden rounded-none rounded-b-md bg-cream md:aspect-auto md:h-full md:rounded-b-none md:rounded-r-md"
        />
      </Reveal>
    </section>
  );
}

/* ---------- FINAL CTA ---------- */
export function FinalCTA() {
  return (
    <section className="relative overflow-hidden">
      <img src={int2} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/80" />
      <div className="container-site relative py-32 text-center md:py-48">
        <Reveal>
          <h2 className="font-display mx-auto max-w-4xl text-5xl md:text-8xl">
            Porozmawiajmy o Twoim dziecku.
          </h2>
          <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed text-muted-foreground">
            Chętnie pokażemy Ci nasze miejsce i odpowiemy na wszystkie pytania.
          </p>
          <div className="mt-10 flex justify-center">
            <ButtonLink to="/kontakt">Umów wizytę</ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- CONTACT ---------- */
export function ContactBlock() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  return (
    <section className="container-site max-lg:pb-0 pb-24 md:pb-36">
      <div className="grid gap-16 lg:grid-cols-12">
        <Reveal className="space-y-10 lg:col-span-5">
          <div>
            <p className="eyebrow mb-3">Adres</p>
            <p className="font-display text-3xl">
              {contact.street}
              <br />
              {contact.city}
            </p>
            <a href={contact.mapsUrl} target="_blank" rel="noreferrer" className="link-underline mt-3 inline-block text-sm">
              Wyznacz trasę →
            </a>
          </div>
          <div>
            <p className="eyebrow mb-3">Telefon</p>
            <a href={contact.phoneHref} className="font-display link-underline text-3xl">{contact.phone}</a>
          </div>
          <div>
            <p className="eyebrow mb-3">E-mail</p>
            <a
              href={`mailto:${contact.email}`}
              className="inline-block w-fit max-w-full text-lg"
            >
              <span className="link-underline break-all">{contact.email}</span>
            </a>
          </div>
          <div>
            <p className="eyebrow mb-3">Godziny otwarcia</p>
            <p className="text-lg">{contact.hours}</p>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-7 lg:col-start-6" delay={100}>
          <div
            id="wizyta"
            className="scroll-mt-28 w-full rounded-md bg-secondary px-5 py-5 md:px-8 md:py-6"
          >
            <h2 className="font-display text-3xl md:text-4xl">Umów wizytę</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Zostaw kontakt — oddzwonimy i ustalimy dogodny termin.
            </p>
            {sent ? (
              <div
                className="mt-6 rounded-md bg-sand p-6 leading-relaxed"
                aria-live="polite"
                role="status"
              >
                <p className="font-display text-2xl text-foreground">
                  Dziękujemy!
                </p>
                <p className="mt-3 text-base text-muted-foreground">
                  Otrzymaliśmy Twoje zapytanie. Skontaktujemy się z Tobą w ciągu 24h.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setSubmitError(null);
                  }}
                  className="link-underline mt-6 text-sm font-medium text-foreground"
                >
                  Wyślij kolejne zapytanie
                </button>
              </div>
            ) : (
              <form
                className="mt-5 space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!e.currentTarget.reportValidity()) return;
                  const f = new FormData(e.currentTarget);
                  setSubmitError(null);
                  setSending(true);
                  const result = await submitContact({
                    name: String(f.get("name") ?? "").trim(),
                    email: String(f.get("email") ?? "").trim(),
                    phone: String(f.get("phone") ?? "").trim(),
                    message: String(f.get("msg") ?? "").trim(),
                  });
                  setSending(false);
                  if (result.ok) {
                    setSent(true);
                    return;
                  }
                  const detail = result.message?.trim();
                  setSubmitError(
                    detail
                      ? `Nie udało się wysłać zapytania: ${detail} Spróbuj ponownie lub zadzwoń: ${contact.phone}.`
                      : `Nie udało się wysłać zapytania. Spróbuj ponownie lub zadzwoń: ${contact.phone}.`,
                  );
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Imię i nazwisko
                    </span>
                    <input
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      maxLength={120}
                      className="mt-1.5 w-full border-b border-foreground/20 bg-transparent py-2 text-base outline-none transition-colors focus:border-foreground"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">
                      Telefon (opcjonalnie)
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      maxLength={40}
                      className="mt-1.5 w-full border-b border-foreground/20 bg-transparent py-2 text-base outline-none transition-colors focus:border-foreground"
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Adres e-mail
                  </span>
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={120}
                    className="mt-1.5 w-full border-b border-foreground/20 bg-transparent py-2 text-base outline-none transition-colors focus:border-foreground"
                  />
                </label>
                <label className="block">
                  <span className="text-xs uppercase tracking-widest text-muted-foreground">
                    Wiadomość
                  </span>
                  <textarea
                    name="msg"
                    required
                    rows={2}
                    maxLength={1000}
                    className="mt-1.5 w-full resize-none border-b border-foreground/20 bg-transparent py-2 text-base outline-none transition-colors focus:border-foreground"
                  />
                </label>
                {submitError && (
                  <p role="alert" className="text-sm leading-relaxed text-destructive" aria-live="polite">
                    {submitError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={sending}
                  className="inline-flex h-10 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-all duration-500 hover:-translate-y-px hover:bg-honey disabled:opacity-60 sm:w-auto"
                >
                  Wyślij zapytanie
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
      <div className="max-lg:py-20 lg:mt-7">
        <iframe
          title="Mapa — Żłobek Misie Tulisie"
          src="https://www.google.com/maps?q=Pozna%C5%84ska+99,+62-200+Gniezno&output=embed"
          className="h-[420px] w-full rounded-md border-0"
          loading="eager"
        />
      </div>
    </section>
  );
}
