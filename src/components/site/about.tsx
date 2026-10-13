import type { ComponentType, ReactNode } from "react";
import foundations from "@/assets/fundamenty.png";
import blocks from "@/assets/zabawa-klockami.jpg";
import lessons from "@/assets/zajecia-rozwojowe.png";
import carers from "@/assets/opiekunki.png";
import rainbow from "@/assets/zajrzyj-tecza.png";
import rooms from "@/assets/sale.png";
import meals from "@/assets/zdrowe-posilki.png";
import arrowMark from "@/assets/strzalka-dlaczego.png";
import shapes from "@/assets/zabawa-ksztalty.jpg";
import { ButtonLink, Photo, Reveal, RevealStaggerList } from "@/components/site/ui";
import { MarkBadge } from "@/components/site/marks";

function MealsMark({ className }: { className?: string }) {
  return <img src={meals} alt="" className={className} />;
}

function LessonsMark({ className }: { className?: string }) {
  return <img src={lessons} alt="" className={className} />;
}

function CarersMark({ className }: { className?: string }) {
  return <img src={carers} alt="" className={className} />;
}

function RoomsMark({ className }: { className?: string }) {
  return <img src={rooms} alt="" className={className} />;
}

function Em({ children }: { children: string }) {
  return <strong className="font-semibold text-foreground">{children}</strong>;
}

export function AboutIntro() {
  return (
    <section className="container-site py-24 md:py-36">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-6">
          <div className="mb-10 h-px w-16 bg-honey" aria-hidden="true" />
          <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
            <p>
              Misie Tulisie to wyjątkowe miejsce stworzone z myślą o
              najmłodszych i ich naturalnej potrzebie poznawania świata. Dbamy o
              to, aby każde dziecko czuło się u nas{" "}
              <Em>bezpiecznie i swobodnie</Em>, a każdy dzień był pełen radości,
              nowych doświadczeń i małych odkryć. Tworzymy ciepłą, przyjazną
              atmosferę, w której dzieci mogą rozwijać się we własnym tempie,
              budować pierwsze relacje z rówieśnikami i stopniowo zdobywać nowe
              umiejętności.
            </p>
            <p>
              Nasze opiekunki z troską i uważnością wspierają maluchy w
              codziennym rozwoju, wykorzystując ich naturalną ciekawość i chęć
              poznawania otaczającego świata.
            </p>
            <p>
              {[
                "Wierzymy, że najlepsza nauka w pierwszych latach życia odbywa się poprzez ",
                <Em key="nauka">
                  zabawę, ruch, doświadczenie i bliską relację z drugim
                  człowiekiem
                </Em>,
                ". Dlatego przygotowujemy różnorodne aktywności wspierające rozwój poznawczy, ruchowy, sensoryczny i emocjonalny dzieci.",
              ]}
            </p>
            <p>
              Codzienność organizujemy w <Em>trzech grupach wiekowych</Em>,
              dzięki czemu możemy dopasować zabawy, zajęcia i rytm dnia do
              możliwości oraz etapu rozwoju każdego malucha. Nie przyspieszamy
              dziecięcego rozwoju - uważnie mu towarzyszymy, wspierając
              samodzielność, pewność siebie i radość z odkrywania nowych rzeczy.
            </p>
          </div>
        </Reveal>
        <Reveal className="lg:col-span-5 lg:col-start-8" delay={80}>
          <Photo
            src={blocks}
            alt="Dziecko układa kolorową wieżę z drewnianych klocków"
            className="aspect-[2/3]"
          />
        </Reveal>
      </div>
    </section>
  );
}

const rights = [
  "bezpieczeństwa i ochrony,",
  "szacunku i poszanowania godności,",
  "wyrażania emocji i własnego zdania,",
  "nauki poprzez zabawę i doświadczenie,",
  "indywidualnego tempa rozwoju.",
];

export function Foundations() {
  return (
    <section className="bg-secondary/70 py-24 md:py-36">
      <div className="container-site grid gap-14 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <img
            src={foundations}
            alt=""
            aria-hidden="true"
            className="mb-8 h-24 w-24 object-contain"
          />
          <h2 className="font-display text-4xl md:text-6xl">
            Fundamenty naszej pracy
          </h2>
        </Reveal>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal delay={80}>
            <p className="text-lg leading-relaxed text-muted-foreground">
              Misie Tulisie działają w oparciu o aktualne podstawy programowe
              oraz wartości zawarte w{" "}
              <Em>Konwencji o prawach dziecka</Em>, w szczególności prawo
              dziecka do:
            </p>
          </Reveal>
          <RevealStaggerList className="mt-10" stagger={820}>
            {rights.map((item, i) => (
              <li
                key={item}
                className="flex items-baseline gap-6 border-t border-border py-5 text-lg leading-relaxed text-muted-foreground last:border-b"
              >
                <span
                  className="font-display w-10 shrink-0 text-2xl text-honey"
                  aria-hidden="true"
                >
                  0{i + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </RevealStaggerList>
        </div>
      </div>
    </section>
  );
}

const reasons = [
  "czują się bezpieczne i akceptowane,",
  "uczą się poprzez zabawę,",
  "rozwijają swoje talenty i samodzielność,",
  "budują relacje i pewność siebie,",
  "spędzają czas w spokojnej, radosnej atmosferze.",
];

export function WhyMisie() {
  return (
    <section className="container-site py-24 md:py-36">
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <Photo
            src={shapes}
            alt="Dziecko wkłada klocki do kolorowej kuli"
            className="aspect-[2/3]"
          />
        </Reveal>
        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal>
            <h2 className="font-display text-5xl md:text-7xl">
              Dlaczego Misie Tulisie?
            </h2>
            <p className="mt-8 text-lg text-muted-foreground">
              Ponieważ w naszym żłobku dzieci:
            </p>
          </Reveal>
          <RevealStaggerList
            className="mt-12 border-b border-border"
            innerStagger={980}
            motion="text-then-arrow"
          >
            {reasons.map((item) => (
              <li
                key={item}
                className="flex items-start gap-4 border-t border-border py-6 text-lg leading-relaxed text-muted-foreground"
              >
                <img
                  src={arrowMark}
                  alt=""
                  aria-hidden="true"
                  className="mt-2.5 h-[0.65rem] w-7 shrink-0 origin-left translate-y-1.5 -rotate-[8deg] object-contain object-left brightness-[0.62] contrast-[1.08]"
                />
                <span>{item}</span>
              </li>
            ))}
          </RevealStaggerList>
          <Reveal delay={80}>
            <p className="mt-16 text-lg leading-relaxed text-muted-foreground">
              Misie Tulisie to przestrzeń, w której zdajemy sobie sprawę, że{" "}
              <Em>dzieciństwo jest naprawdę ważne</Em>, a rodzice mogą mieć
              pewność, że ich dziecko jest w dobrych rękach.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const care: {
  title: string;
  body: ReactNode;
  iconClass: string;
  Icon: ComponentType<{ className?: string }>;
}[] = [
  {
    title: "Zdrowe posiłki każdego dnia.",
    Icon: MealsMark,
    iconClass: "h-10 w-[3.4rem] object-contain",
    body: "Mamy świadomość, jak ważne jest odpowiednie żywienie na tak wczesnym etapie życia. Dlatego korzystamy z zaufanej, sprawdzonej firmy cateringowej, która każdego dnia dostarcza zdrowe, pełnowartościowe i odpowiednio zbilansowane posiłki, uwzględniając indywidualne potrzeby oraz wykluczenia w diecie każdego malucha.",
  },
  {
    title: "Różnorodne zajęcia rozwojowe.",
    Icon: LessonsMark,
    iconClass:
      "size-[5.3rem] max-w-none shrink-0 -translate-x-2 object-contain object-center",
    body: "W świecie, który zmienia się szybciej niż kiedykolwiek wcześniej, dzieci potrzebują czegoś więcej niż tylko tradycyjnych metod nauczania. Potrzebują edukacji, która wspiera ich naturalną ciekawość, daje przestrzeń na samodzielne odkrywanie i rozwija kompetencje niezbędne w nowoczesnym świecie.",
  },
  {
    title: "Odpowiednio wyposażone sale.",
    Icon: RoomsMark,
    iconClass: "size-[2.85rem] -translate-y-0.5 object-contain",
    body: "Wszystkie pomieszczenia naszego żłobka spełniają wszelkie normy wymagane przez sanepid. Sale zabaw wyposażone w najwyższej jakości zabawki oraz pomoce dydaktyczne pozwalają na bezpieczną zabawę i naukę. Wszystkie meble oraz akcesoria Misiów Tulisiów posiadają niezbędne atesty oraz certyfikaty, aby móc bezpiecznie służyć potrzebom najmłodszych.",
  },
  {
    title: "Zaufane i doświadczone opiekunki.",
    Icon: CarersMark,
    iconClass: "size-[3.4rem] translate-y-1 object-contain",
    body: [
      "Wiemy, że nawet najbardziej zaangażowany rodzic nie zawsze ma możliwość zapewnienia dziecku różnorodnych i rozwojowych aktywności każdego dnia. W Misiach Tulisiach dzieci w ciągu dnia otrzymują ",
      <Em key="rytm">
        czas, uważną obecność dorosłego oraz stabilny, przewidywalny rytm dnia
      </Em>,
      ", który daje im poczucie bezpieczeństwa i sprzyja zdrowemu rozwojowi.",
    ],
  },
];

export function CareAreas() {
  return (
    <section className="container-site py-24 md:py-36">
      <ul className="grid border-b border-border md:grid-cols-2">
        {care.map(({ title, body, Icon, iconClass }, i) => (
          <li
            key={title}
            className={
              i % 2 === 1
                ? "border-t border-border py-12 md:border-l md:py-16 md:pl-12 lg:pl-16"
                : "border-t border-border py-12 md:py-16 md:pr-12 lg:pr-16"
            }
          >
            <MarkBadge>
              <Icon className={iconClass} />
            </MarkBadge>
            <h2 className="mt-8 max-w-sm font-display text-3xl leading-tight md:text-4xl">
              {title}
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              {body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function GalleryVisit() {
  return (
    <section className="bg-secondary/70 py-24 md:py-36">
      <div className="container-site grid items-center gap-12 lg:grid-cols-12">
        <div className="text-honey/80 lg:col-span-4" aria-hidden="true">
          <img
            src={rainbow}
            alt=""
            className="h-32 w-auto max-w-full md:h-40"
          />
        </div>
        <Reveal className="lg:col-span-7 lg:col-start-6">
          <h2 className="font-display text-5xl md:text-7xl">Zajrzyj do nas.</h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
            Zapraszamy do obejrzenia galerii.
          </p>
          <ButtonLink to="/galeria" className="mt-10">
            Zobacz galerię
          </ButtonLink>
        </Reveal>
      </div>
    </section>
  );
}
