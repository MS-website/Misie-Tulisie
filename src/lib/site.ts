export const contact = {
  name: "Żłobek Misie Tulisie",
  street: "ul. Poznańska 99",
  city: "62-200 Gniezno",
  phone: "+48 791 201 298",
  phoneHref: "tel:+48791201298",
  email: "kontakt@zlobekmisietulisie.pl",
  /** Odbiór formularzy Web3Forms i kart zgłoszenia (na razie stara skrzynka). */
  formsInboxEmail: "zlobekmisietulisie@onet.pl",
  hours: "7:00–18:00",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Pozna%C5%84ska+99+62-200+Gniezno",
};

export const nav = [
  { to: "/o-nas", label: "O nas" },
  { to: "/dla-rodzicow", label: "Dla rodziców" },
  { to: "/rekrutacja", label: "Rekrutacja" },
  { to: "/aktywny-maluch", label: "Aktywny Maluch" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

/** Kanoniczna domena produkcyjna (bez www). */
export const SITE_ORIGIN = "https://zlobekmisietulisie.pl";

export const OG_IMAGE_PATH = "/og-misie-tulisie.jpg";

const OG_IMAGE_ALT =
  "Żłobek Misie Tulisie — logo, hasło strony głównej i zdjęcie z żłobka";

function siteOrigin(): string {
  const fromVite = import.meta.env["VITE_SITE_URL"];
  if (typeof fromVite === "string" && fromVite.trim()) {
    return fromVite.trim().replace(/\/$/, "");
  }

  const fromProcess =
    typeof process !== "undefined"
      ? process.env["URL"] ?? process.env["DEPLOY_PRIME_URL"]
      : undefined;
  if (typeof fromProcess === "string" && fromProcess.trim()) {
    try {
      const host = new URL(fromProcess.trim()).hostname.replace(/^www\./, "");
      if (host === "zlobekmisietulisie.pl") return SITE_ORIGIN;
    } catch {
      /* ignoruj niepoprawny URL z hostingu */
    }
  }

  return SITE_ORIGIN;
}

export function absoluteUrl(path: string): string {
  const origin = siteOrigin();
  if (!path || path === "/") return `${origin}/`;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${normalized}`;
}

function canonicalPath(path: string): string {
  if (!path || path === "/") return "/";
  const withSlash = path.startsWith("/") ? path : `/${path}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

/** Meta SEO + canonical dla konkretnej ścieżki (nie używaj samego „/” dla podstron). */
export function seo(title: string, description: string, path: string) {
  const pathname = canonicalPath(path);
  const url = absoluteUrl(pathname);
  const image = absoluteUrl(OG_IMAGE_PATH);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
      { property: "og:site_name", content: "Żłobek Misie Tulisie" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pl_PL" },
      { property: "og:image", content: image },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:alt", content: OG_IMAGE_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      { name: "twitter:image:alt", content: OG_IMAGE_ALT },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
