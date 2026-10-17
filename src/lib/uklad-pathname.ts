import { useRouterState } from "@tanstack/react-router";

export function layoutPathname(routerPath: string, locationPath: string | null) {
  if (locationPath == null) return routerPath;
  if (
    routerPath === "/" &&
    locationPath !== "/" &&
    locationPath.startsWith("/")
  ) {
    return locationPath;
  }
  return routerPath;
}

function pathnameFromMatches(
  matches: { pathname?: string }[],
  fallback: string,
) {
  const leaf = matches.at(-1);
  if (leaf?.pathname) return leaf.pathname;
  return fallback;
}

/**
 * Ścieżka układu zsynchronizowana z faktycznie renderowaną trasą (leaf match),
 * nie z docelowym location, które przy nawigacji SPA może wyprzedzać <Outlet>.
 * Przy hydratacji podstrony koryguje chwilowe „/” w stanie routera.
 */
export function useLayoutPathname() {
  const { routerPath, matchPath } = useRouterState({
    select: (state) => ({
      routerPath: state.location.pathname,
      matchPath: pathnameFromMatches(
        state.matches as { pathname?: string }[],
        state.location.pathname,
      ),
    }),
  });
  if (typeof window === "undefined") return matchPath;
  const hydrated = layoutPathname(routerPath, window.location.pathname);
  if (routerPath === "/" && hydrated !== routerPath) return hydrated;
  return matchPath;
}
