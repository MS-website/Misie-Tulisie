import type { ReactNode } from "react";
import hero from "@/assets/hero.jpg";
import missionPhoto from "@/assets/story.jpg";
import playPhoto from "@/assets/rozwój-zabawa.jpg";
import spacePhoto from "@/assets/galeria-1.jpg";
import childPhoto from "@/assets/zabawa-ksztalty.jpg";
import adaptPhoto from "@/assets/interior-1.jpg";
import { ButtonLink, Eyebrow, Photo, Reveal } from "./ui";
import { cn } from "@/lib/utils";

function IconTile({
  label,
  children,
  ring,
}: {
  label: string;
  children: ReactNode;
  ring: "sage" | "blush";
}) {
  return (
    <li className="flex min-w-0 flex-col items-center gap-3 text-center sm:items-start sm:text-left">
      <span
        className={cn(
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-border/60",
          ring === "sage" ? "bg-sage-soft/80" : "bg-blush/70",
        )}
        aria-hidden="true"
      >
        {children}
      </span>
      <span className="text-sm leading-snug text-foreground">{label}</span>
    </li>
  );
}

const stroke = "stroke-honey";
const strokeSoft = "stroke-sage";

function IconPlay() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <path d="M8 22c2-6 6-10 12-12M10 10l4 4M18 8l-2 6" className={stroke} strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="22" cy="20" r="3" className={strokeSoft} strokeWidth="1.25" />
    </svg>
  );
}

function IconIndependence() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <circle cx="16" cy="8" r="3" className={stroke} strokeWidth="1.25" />
      <path d="M10 26v-8l6-4 6 4v8" className={stroke} strokeWidth="1.25" strokeLinejoin="round" />
    </svg>
  );
}

function IconMovement() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <path d="M8 24c4-10 12-14 20-12" className={strokeSoft} strokeWidth="1.25" strokeLinecap="round" />
      <path d="M14 12l-2 6 6-2" className={stroke} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconSpeech() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <path
        d="M8 12a8 8 0 0116 0v4a8 8 0 01-16 0v-4z"
        className={stroke}
        strokeWidth="1.25"
      />
      <path d="M12 24h4l2 4" className={strokeSoft} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconPeers() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="3" className={stroke} strokeWidth="1.25" />
      <circle cx="21" cy="11" r="3" className={strokeSoft} strokeWidth="1.25" />
      <path d="M6 26c0-4 3-7 7-7M19 19c4 0 7 3 7 7" className={stroke} strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function IconCooperation() {
  return (
    <svg viewBox="0 0 32 32" className="h-7 w-7" fill="none" aria-hidden="true">
      <path
        d="M10 18c0-3 2-5 6-5s6 2 6 5M8 22h16"
        className={stroke}
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path d="M12 14l4-4 4 4" className={strokeSoft} strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const activities = [
  { label: "Swobodna i twórcza zabawa", Icon: IconPlay, ring: "sage" as const },
  { label: "Rozwijanie samodzielności", Icon: IconIndependence, ring: "blush" as const },
  { label: "Aktywność ruchowa", Icon: IconMovement, ring: "sage" as const },
  { label: "Rozwijanie mowy i komunikacji", Icon: IconSpeech, ring: "blush" as const },
  { label: "Budowanie relacji z rówieśnikami", Icon: IconPeers, ring: "sage" as const },
  { label: "Nauka współpracy i wyrażania emocji", Icon: IconCooperation, ring: "blush" as const },
];

export function HomeHero() {
  return (
    <section className="relative min-w-0 pt-28 md:pt-32">
      <div className="container-site grid min-w-0 items-end gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 pb-4 lg:col-span-6 lg:pb-24">
          <Reveal>
            <Eyebrow>Żłobek w Gnieźnie</Eyebrow>
            <h1 className="font-display max-w-xl text-[clamp(2.125rem,4.2vw+1rem,6.5rem)] leading-[1.04]">
              Miejsce, w którym małe kroki mają <em className="text-honey">wielkie</em> znaczenie.
            </h1>
          </Reveal>
          <Reveal delay={150}>
            <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:mt-8 sm:text-lg">
              Misie Tulisie to bezpieczna, ciepła przestrzeń, w której dzieci mogą rozwijać się we
              własnym tempie, a rodzice zyskują spokój i pewność, że ich dziecko jest pod dobrą
              opieką.
            </p>
            <div className="mt-8 sm:mt-10">
              <ButtonLink to="/o-nas">Poznaj Misie Tulisie →</ButtonLink>
            </div>
          </Reveal>
        </div>
        <Reveal className="min-w-0 lg:col-span-6" delay={100}>
          <Photo
            src={hero}
            alt="Opiekunka bawi się z dzieckiem drewnianymi klockami"
            className="aspect-[4/5] max-w-full lg:aspect-[9/11]"
            eager
          />
        </Reveal>
      </div>
    </section>
  );
}

export function HomeMission() {
  return (
    <section className="container-site min-w-0 py-20 md:py-28">
      <div className="grid min-w-0 items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 lg:col-span-6">
          <Reveal>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">Nasza misja</h2>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              Naszą misją jest stworzenie miejsca, w którym każde dziecko czuje się{" "}
              <span className="font-medium text-foreground">
                bezpieczne, ważne i otoczone troską
              </span>
              . Chcemy, aby pobyt w żłobku był dla maluchów czasem pełnym radości, odkrywania
              świata i pierwszych dziecięcych przyjaźni.
            </p>
          </Reveal>
        </div>
        <Reveal className="min-w-0 lg:col-span-5 lg:col-start-8" delay={80}>
          <Photo
            src={missionPhoto}
            alt="Dziecko w spokojnej, ciepłej sytuacji podczas zabawy"
            className="aspect-[4/5] max-w-full"
          />
        </Reveal>
      </div>
    </section>
  );
}

export function HomePlayGrowth() {
  return (
    <section className="border-y border-border/80 bg-cream/50 py-20 md:py-28">
      <div className="container-site min-w-0">
        <div className="grid min-w-0 items-start gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-6">
            <Reveal>
              <h2 className="font-display text-4xl md:text-5xl">Rozwój przez zabawę</h2>
              <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
                W Misiach Tulisiach dbamy o ciepłą, rodzinną atmosferę, w której dzieci mogą
                rozwijać się we własnym tempie. Pod czujnym okiem troskliwych opiekunek maluchy
                każdego dnia uczą się poprzez zabawę, rozwijają samodzielność, poznają otaczający
                je świat, zdobywają nowe umiejętności i budują relacje z rówieśnikami.
              </p>
            </Reveal>
            <Reveal delay={120}>
              <ul className="mt-12 grid min-w-0 grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
                {activities.map(({ label, Icon, ring }) => (
                  <IconTile key={label} label={label} ring={ring}>
                    <Icon />
                  </IconTile>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal className="min-w-0 lg:col-span-5 lg:col-start-8" delay={80}>
            <Photo
              src={playPhoto}
              alt="Dwoje dzieci bawi się drewnianymi klockami w jasnej sali"
              className="aspect-[4/3] max-w-full md:aspect-[3/2]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function HomeSpace() {
  return (
    <section className="bg-sage-soft/90 py-20 md:py-28">
      <div className="container-site min-w-0">
        <div className="grid min-w-0 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="min-w-0 lg:col-span-6">
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">
              Przestrzeń dla najmłodszych
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-muted-foreground">
              <p>
                Dysponujemy kolorowymi, nowoczesnymi salami dostosowanymi do potrzeb najmłodszych.
                Wyposażyliśmy je w zabawki i pomoce edukacyjne, wspierające rozwój ruchowy,
                sensoryczny i poznawczy maluchów.
              </p>
              <p>
                Dbamy o każdy szczegół przestrzeni, w której dzieci spędzają swój dzień.
                Wykorzystane przez nas wyposażenie, zabawki i materiały posiadają wymagane atesty
                oraz certyfikaty, a sam żłobek został przygotowany z uwzględnieniem obowiązujących
                wymogów bezpieczeństwa.
              </p>
            </div>
          </Reveal>
          <Reveal className="min-w-0 lg:col-span-5 lg:col-start-8" delay={100}>
            <Photo
              src={spacePhoto}
              alt="Jasna sala żłobkowa z drewnianymi zabawkami"
              className="aspect-[4/3] max-w-full md:aspect-[5/4]"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function HomeIndividualApproach() {
  return (
    <section className="container-site min-w-0 py-20 md:py-24">
      <div className="grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-8">
        <Reveal className="min-w-0 rounded-md bg-blush/50 p-8 md:p-10 lg:p-12">
          <Eyebrow>Każde dziecko</Eyebrow>
          <h2 className="font-display text-3xl md:text-4xl">Każde dziecko jest wyjątkowe</h2>
          <div className="mt-6 grid min-w-0 gap-8 md:grid-cols-[min(9rem,35%)_1fr] md:items-start">
            <Photo
              src={childPhoto}
              alt="Dziecko bawi się w żłobku"
              className="aspect-square max-w-full md:max-w-[9rem]"
            />
            <div className="min-w-0 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
              <p>
                Codzienność naszych podopiecznych organizujemy w trzech grupach wiekowych, dzięki
                czemu możemy dostosować zajęcia, rytm dnia oraz poziom aktywności do wieku i etapu
                rozwoju dzieci.
              </p>
              <p>
                Nie oczekujemy od wszystkich maluchów tego samego. Obserwujemy ich potrzeby,
                dostrzegamy naturalne predyspozycje i pomagamy rozwijać to, co wzbudza ich
                ciekawość.
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal className="min-w-0 rounded-md bg-cream p-8 md:p-10 lg:p-12" delay={80}>
          <div className="mb-6 flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-secondary"
              aria-hidden="true"
            >
              <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none">
                <path
                  d="M16 6c-4 0-7 3-7 7v2c0 4 3 7 7 7s7-3 7-7v-2c0-4-3-7-7-7z"
                  className="stroke-honey"
                  strokeWidth="1.25"
                />
                <path d="M10 24c2 2 4 3 6 3s4-1 6-3" className="stroke-sage" strokeWidth="1.25" strokeLinecap="round" />
              </svg>
            </span>
            <div className="min-w-0">
              <Eyebrow>Adaptacja</Eyebrow>
              <h2 className="font-display text-3xl md:text-4xl">Bezpieczna adaptacja</h2>
            </div>
          </div>
          <Photo
            src={adaptPhoto}
            alt="Spokojna interakcja opiekunki z dzieckiem w żłobku"
            className="mb-8 aspect-[16/10] max-w-full"
          />
          <div className="min-w-0 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            <p>
              Wiemy, jak dużym wydarzeniem zarówno dla rodziców, jak i dla dziecka jest rozpoczęcie
              przygody ze żłobkiem. Dlatego szczególną uwagę przykładamy do poczucia bezpieczeństwa
              dziecka, łagodnej adaptacji oraz indywidualnego podejścia do jego potrzeb. Każde
              dziecko jest inne – ma swój temperament, rytm dnia, zainteresowania i sposób
              poznawania świata. Chcemy je poznać, zrozumieć i towarzyszyć mu w rozwoju z uważnością
              oraz szacunkiem.
            </p>
            <p>
              Wspieramy dzieci również w codziennych wyzwaniach – pierwszych rozstaniach z
              rodzicem, nauce samodzielności, komunikowaniu swoich potrzeb czy budowaniu relacji z
              innymi.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function HomeDiscover() {
  return (
    <section className="border-t border-border bg-secondary/40 py-24 md:py-32">
      <div className="container-site min-w-0 text-center">
        <Reveal>
          <p className="font-display mx-auto max-w-3xl text-3xl leading-snug md:text-4xl lg:text-5xl">
            Wierzymy, że żłobek to coś więcej niż dobra opieka – to miejsce, które daje dzieciom
            radość, a rodzicom spokój i poczucie zaufania.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <ButtonLink to="/o-nas">Poznaj nas bliżej</ButtonLink>
            <ButtonLink to="/galeria" variant="ghost">
              Zobacz nasz żłobek
            </ButtonLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
