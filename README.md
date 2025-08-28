# Employee Reward Slot-Machine (Static GitHub Pages)

Weiche Slot-Optik mit Hebel, echte Reel-Animation (staggered), Legende & Rewards, Gewinnlogik und Sammlung via `localStorage`.

## Struktur
- `index.html` – Slot-Machine
- `collection.html` – Meine Sammlung
- `styles.css` – Design (viadee-inspiriert)
- `app.js` – Logik & Animation (ES Module)
- `collection.js` – Sammlung (ES Module)
- `utils.js` – RNG, Storage, Rewards (ES Module)
- `confetti.js` – Mini-Konfetti (global)
- `.nojekyll` – deaktiviert Jekyll
- `assets/viadee-logo.png` – optionales Logo

## Deploy
1. Dateien in Repo kopieren.
2. Optional `assets/viadee-logo.png` hinzufügen.
3. GitHub Pages aktivieren: Settings → Pages → Deploy from branch → `main` → root.
4. Fertig.

## Anpassungen
- Gewichte: `utils.js` → `SYMBOLS.weight`
- Rewards: `utils.js` → `REWARDS`
- Animation: `app.js` → `stepMs`/`base`
- Farben: `styles.css` → `:root` Variablen
