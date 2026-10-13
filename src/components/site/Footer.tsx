import { Link, useRouterState } from "@tanstack/react-router";
import { contact, nav } from "@/lib/site";
import { Logo } from "./Header";
import { ButtonLink } from "./ui";

export function Footer() {
  const showContactButton = useRouterState({
    select: (state) => state.location.pathname !== "/kontakt",
  });

  return (
    <footer className="border-t border-border bg-secondary/60">
      <div className="container-site grid gap-14 py-20 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo size="lg" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Bezpieczna i ciepła przestrzeń dla najmłodszych.
          </p>
          {showContactButton && (
            <ButtonLink to="/kontakt" className="mt-8">
              Skontaktuj się z nami
            </ButtonLink>
          )}
        </div>
        <div className="md:col-span-3">
          <p className="eyebrow mb-5">Strona</p>
          <ul className="space-y-3 text-sm">
            {nav.map((n) => (
              <li key={n.to}>
                <Link to={n.to} className="link-underline">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-4">
          <p className="eyebrow mb-5">Kontakt</p>
          <address className="space-y-3 text-sm not-italic leading-relaxed">
            <p>
              {contact.street}
              <br />
              {contact.city}
            </p>
            <p>
              <a href={contact.phoneHref} className="link-underline">
                {contact.phone}
              </a>
            </p>
            <p>
              <a href={`mailto:${contact.email}`} className="link-underline">
                {contact.email}
              </a>
            </p>
            <p className="text-muted-foreground">Godziny otwarcia: {contact.hours}</p>
          </address>
        </div>
      </div>
      <div className="container-site flex flex-col gap-3 border-t border-border py-8 text-xs text-muted-foreground md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} Misie Tulisie</p>
        <div className="flex gap-6">
          <a href="#" className="link-underline">Polityka prywatności</a>
          <a href="#" className="link-underline">Cookies</a>
        </div>
      </div>
    </footer>
  );
}
