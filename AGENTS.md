# Misie Tulisie

Strona żłobka. Teksty dla użytkownika są po polsku.

Pisz kod jak w zwykłym, utrzymywanym projekcie: bez banerów generatorów, bez komentarzy tutoriałowych i bez nazw narzędzi w źródle, README albo commitach. Nie ruszaj treści, layoutu ani assetów, jeśli zadanie tego nie wymaga. Komentarze tylko tam, gdzie wyjaśniają nietrywialne zachowanie.

## Przywracanie z Gita

Gdy użytkownik prosi o **przywrócenie ostatniej wersji z Gita**, przywróć stan z **`origin/main`** (nie lokalne kopie zapasowe ani pliki `??` w katalogu projektu). Standardowo: `git fetch origin` i `git reset --hard origin/main` na gałęzi `main` — o ile użytkownik nie prosi o inny commit lub tag.

Układ stron jest w **`src/uklad.json`** w repozytorium. W dev przeglądarka może nadpisywać podgląd przez `localStorage` (`misie-uklad-v1`); po przywróceniu z Gita warto to wspomnieć, jeśli widok nadal się różni.

**Vercel / Netlify = tylko to, co jest w Gicie.** Przy działającym `npm run dev` edytor Układ po ~1,2 s zapisuje też `src/uklad.json` (nie tylko `localStorage`). Po sesji edycji: **commit + push** `src/uklad.json`. Odzysk ręczny: `copy(localStorage.getItem("misie-uklad-v1"))` → plik → `npm run uklad:import -- ścieżka/do/pliku.json`.

Znacznik **`stan-zapisany-2026-10-18`** wskazuje zatwierdzony zapis (m.in. karta opłat, układ dla rodziców, rubryki O nas).
