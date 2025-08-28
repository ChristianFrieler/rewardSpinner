# Employee Reward Slot-Machine (Static GitHub Pages)

Ein leichter, barrierearmer Slot-Machine-Prototyp (3 Reels) mit viadee-inspiriertem UI.
- Kein Backend, State via `localStorage`
- Gewinn: 3× identisch (außer ZONK), Toast + Mini-Konfetti
- Sammlung mit Zähler, Sortierung (Seltenheit, Anzahl, Name)

## Deploy
1. Repo erstellen, Dateien kopieren.
2. Optional: `assets/viadee-logo.png` (PNG) hinzufügen.
3. **GitHub Pages** aktivieren: Settings → Pages → Deploy from branch → `main` → `/ (root)`.
4. `.nojekyll` Datei sicherstellen (leer).

## Entwickeln
Einfach lokal öffnen. Kein Build nötig.

## Symbole & Gewichte
- Volker (24), Markus (24), Katze (24), ZONK (26), viadee (2).
`utils.js` → `SYMBOLS` anpassen.

## A11y
- `aria-live` für Toast
- Fokus-Outlines sichtbar
- `prefers-reduced-motion` via OS (Animationen kurz & dezent)

## License
MIT
