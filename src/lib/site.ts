export const contact = {
  name: "Żłobek Misie Tulisie",
  street: "ul. Poznańska 99",
  city: "62-200 Gniezno",
  phone: "+48 791 201 298",
  phoneHref: "tel:+48791201298",
  email: "kontakt@zlobekmisietulisie.pl",
  hours: "7:00–18:00",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=Pozna%C5%84ska+99+62-200+Gniezno",
};

export const nav = [
  { to: "/o-nas", label: "O nas" },
  { to: "/opieka", label: "Opieka" },
  { to: "/dla-rodzicow", label: "Dla rodziców" },
  { to: "/rekrutacja", label: "Rekrutacja" },
  { to: "/galeria", label: "Galeria" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

export function seo(title: string, description: string) {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}
