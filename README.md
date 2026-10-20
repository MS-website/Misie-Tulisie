# Żłobek Misie Tulisie

Strona żłobka Misie Tulisie w Gnieźnie.

```sh
npm install
npm run dev
```

## Wdrożenie

**Vercel:** `npm run build`. Katalogu wynikowego nie ustawiaj ręcznie: przy zmiennej `VERCEL` Nitro zapisuje `.vercel/output`.

**Netlify (SSR):** `npm run build` (CI ustawia `NETLIFY`). Publish directory: `dist`. Handler SSR trafia do `.netlify/functions-internal`. Ustawienia są w `netlify.toml`.

Formularz kontaktowy wymaga zmiennej środowiskowej `VITE_WEB3FORMS_ACCESS_KEY` (Production / Deploy Preview) — patrz `.env.example`.
