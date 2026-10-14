import heroWalk from "@/assets/story.jpg";
import missionKids from "@/assets/rozwój-zabawa.jpg";
import playCare from "@/assets/hero.jpg";
import spacePhoto from "@/assets/galeria-1.jpg";
import developmentMap from "@/assets/mapa-rozwoju-zabawa.png";
import { ButtonLink, Photo } from "./ui";

const developmentMapAlt =
  "Swobodna i twórcza zabawa, rozwijanie samodzielności, aktywność ruchowa, rozwijanie mowy i komunikacji, budowanie relacji z rówieśnikami, nauka współpracy i wyrażania emocji";

export function HomeHero() {
  return (
    <section className="relative min-w-0 pt-28 md:pt-32">
      <div className="container-site grid min-w-0 items-end gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 pb-2 lg:col-span-6 lg:pb-16">
          <p className="eyebrow mb-6">Żłobek w Gnieźnie</p>
          <h1 className="font-display max-w-xl text-[clamp(2.5rem,4.4vw,5.75rem)] leading-[1.02]">
            Miejsce,
            <br />
            w którym małe
            <br />
            kroki mają
            <br />
            <em><span className="text-honey">wielkie</span> znaczenie</em>
          </h1>
          <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Misie Tulisie to bezpieczna, ciepła przestrzeń, w której dzieci mogą rozwijać się we
            własnym tempie, a rodzice zyskują spokój i pewność, że ich dziecko jest pod dobrą
            opieką.
          </p>
          <div className="mt-8 sm:mt-10">
            <ButtonLink to="/o-nas">Poznaj Misie Tulisie →</ButtonLink>
          </div>
        </div>
        <div className="min-w-0 lg:col-span-6">
          <Photo
            src={heroWalk}
            alt="Dziecko trzymające opiekunkę za rękę podczas pierwszych kroków"
            className="aspect-[4/5] max-w-full lg:aspect-[4/5]"
            eager
          />
        </div>
      </div>
    </section>
  );
}

export function HomeMission() {
  return (
    <section className="container-site min-w-0 py-16 md:py-24">
      <div className="grid min-w-0 items-center gap-10 lg:grid-cols-12 lg:gap-16">
        <div className="min-w-0 lg:col-span-6">
          <Photo
            src={missionKids}
            alt="Dwoje dzieci bawi się drewnianymi klockami w jasnej sali"
            eager
            className="aspect-[4/3] max-w-full"
          />
        </div>
        <div className="min-w-0 lg:col-span-5 lg:col-start-8">
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl">Nasza misja</h2>
          <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
            Naszą misją jest stworzenie miejsca, w którym każde dziecko czuje się{" "}
            <span className="font-medium text-foreground">
              bezpieczne, ważne i otoczone troską
            </span>
            . Chcemy, aby pobyt w żłobku był dla maluchów czasem pełnym radości, odkrywania
            świata i pierwszych dziecięcych przyjaźni.
          </p>
        </div>
      </div>
    </section>
  );
}

export function HomePlayGrowth() {
  return (
    <section className="border-y border-border/80 bg-white py-16 md:py-24">
      <div className="container-site min-w-0">
        <div className="grid min-w-0 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-6">
            <h2 className="font-display text-4xl md:text-5xl">Rozwój przez zabawę</h2>
            <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
              W Misiach Tulisiach dbamy o ciepłą, rodzinną atmosferę, w której dzieci mogą
              rozwijać się we własnym tempie. Pod czujnym okiem troskliwych opiekunek maluchy
              każdego dnia uczą się poprzez zabawę, rozwijają samodzielność, poznają otaczający
              je świat, zdobywają nowe umiejętności i budują relacje z rówieśnikami.
            </p>
            <Photo
              src={developmentMap}
              alt={developmentMapAlt}
              fit="contain"
              eager
              className="mt-10 w-full max-w-xl"
            />
          </div>
          <div className="min-w-0 lg:col-span-5 lg:col-start-8">
            <Photo
              src={playCare}
              alt="Opiekunka bawi się z dzieckiem drewnianymi klockami"
              eager
              className="aspect-[4/5] max-w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeSpace() {
  return (
    <section className="bg-space-fill py-16 md:py-24">
      <div className="container-site min-w-0">
        <div className="grid min-w-0 items-center gap-10 lg:grid-cols-12 lg:gap-16">
          <div className="min-w-0 lg:col-span-6">
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
          </div>
          <div className="min-w-0 lg:col-span-5 lg:col-start-8">
            <Photo
              src={spacePhoto}
              alt="Jasna sala żłobkowa z drewnianymi zabawkami"
              eager
              className="aspect-[16/10] max-w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomeIndividualApproach() {
  return (
    <section className="container-site min-w-0 py-16 md:py-24">
      <div className="grid min-w-0 gap-6 lg:grid-cols-2 lg:gap-8">
        <article className="min-w-0 rounded-md bg-berry-card p-8 md:p-10 lg:p-12">
          <h2 className="font-display text-3xl md:text-4xl">Każde dziecko jest wyjątkowe</h2>
          <div className="mt-6 min-w-0 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
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
        </article>
        <article className="min-w-0 rounded-md bg-berry-card p-8 md:p-10 lg:p-12">
          <h2 className="font-display text-3xl md:text-4xl">Małe kroki ku nowemu</h2>
          <div className="mt-6 min-w-0 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            <p>
              Wiemy, jak dużym wydarzeniem zarówno dla rodziców,{" "}
              <br className="hidden min-[82rem]:block" />
              jak i dla dziecka jest rozpoczęcie przygody ze żłobkiem.{" "}
              <br className="hidden min-[82rem]:block" />
              Dlatego szczególną uwagę przykładamy do poczucia{" "}
              <br className="hidden min-[82rem]:block" />
              bezpieczeństwa dziecka, łagodnej adaptacji oraz{" "}
              <br className="hidden min-[82rem]:block" />
              indywidualnego podejścia do jego potrzeb. Każde dziecko{" "}
              <br className="hidden min-[82rem]:block" />
              jest inne – ma swój temperament, rytm dnia, zainteresowania{" "}
              <br className="hidden min-[82rem]:block" />
              i sposób poznawania świata. Chcemy je poznać, zrozumieć{" "}
              <br className="hidden min-[82rem]:block" />
              i towarzyszyć mu w rozwoju z uważnością oraz szacunkiem.
            </p>
            <p>
              Wspieramy dzieci również w codziennych wyzwaniach – pierwszych rozstaniach z
              rodzicem, nauce samodzielności, komunikowaniu swoich potrzeb czy budowaniu relacji z
              innymi.
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}

export function HomeDiscover() {
  return (
    <section className="border-t border-border/70 bg-background py-20 md:py-28">
      <div className="container-site min-w-0 text-center">
        <p className="font-display mx-auto max-w-3xl text-3xl leading-snug md:text-4xl lg:text-5xl lg:leading-[1.2]">
          Wierzymy, że żłobek to coś więcej
          <br className="hidden md:block" />
          niż dobra opieka – to miejsce, które daje
          <br className="hidden md:block" />
          dzieciom radość, a rodzicom spokój
          <br className="hidden md:block" />i poczucie zaufania.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <ButtonLink to="/o-nas">Poznaj nas bliżej</ButtonLink>
          <ButtonLink to="/galeria" variant="ghost">
            Zobacz nasz żłobek
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
