import hero from "@/assets/hero.jpg";
import missionPhoto from "@/assets/story.jpg";
import playPhoto from "@/assets/rozwój-zabawa.jpg";
import spacePhoto from "@/assets/galeria-1.jpg";
import developmentMap from "@/assets/mapa-rozwoju-zabawa.png";
import { ButtonLink, Eyebrow, Photo, Reveal } from "./ui";

const developmentMapAlt =
  "Swobodna i twórcza zabawa, rozwijanie samodzielności, aktywność ruchowa, rozwijanie mowy i komunikacji, budowanie relacji z rówieśnikami, nauka współpracy i wyrażania emocji";

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
    <section className="border-y border-border/80 bg-white py-20 md:py-28">
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
              <Photo
                src={developmentMap}
                alt={developmentMapAlt}
                fit="contain"
                className="mt-12 aspect-[4/3] w-full max-w-full sm:aspect-[3/2]"
              />
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
    <section className="bg-space-fill py-20 md:py-28">
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
        <Reveal className="min-w-0 rounded-md bg-berry-card p-8 md:p-10 lg:p-12">
          <Eyebrow>Każde dziecko</Eyebrow>
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
        </Reveal>

        <Reveal className="min-w-0 rounded-md bg-berry-card p-8 md:p-10 lg:p-12" delay={80}>
          <Eyebrow>Adaptacja</Eyebrow>
          <h2 className="font-display text-3xl md:text-4xl">Bezpieczna adaptacja</h2>
          <div className="mt-6 min-w-0 space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg">
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
    <section className="border-t border-border bg-discover-fill py-24 md:py-32">
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
