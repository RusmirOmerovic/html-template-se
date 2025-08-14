# html-template-se (develop)

Dies ist die Basisstruktur für das GitHub CI/CD Template `html-template-se`.

- Branch: `develop`
- Mini-Demo: Dark Mode Toggle mit HTML/CSS/JS
- Workflows: `.github/workflows/preview.yml` (für Testing + GitHub Pages Preview)

## Features

- Einfacher Dark-Mode-Button mit HTML/CSS/JS
- Linting- und Formatierungs-Skripte für HTML, CSS und JavaScript
- Automatisches Deployment einer Preview via GitHub Actions

## Installation

```bash
git clone <repo>
cd html-template-se
npm install
```

## Nutzung

- Öffne `index.html` im Browser, um die Demo zu sehen.
- Linting prüfen: `npm run lint`
- Dokumentation generieren: `node scripts/generate-docs.mjs` kopiert die README nach `docs/`.

## CI/CD

Die GitHub Actions Workflow-Datei `.github/workflows/preview.yml` führt Linting aus und veröffentlicht eine GitHub Pages Preview.

## Ordnerstruktur

```
.
├── docs/                # generierte Dokumentation
├── scripts/             # Hilfsskripte
├── index.html           # Startseite
├── index.css            # Styles
├── index.js             # JS-Logik (Dark-Mode-Toggle)
├── .github/workflows/   # CI/CD Workflows
└── ...
```

## License

Dieses Projekt steht unter der MIT License. Weitere Details in [LICENSE](LICENSE).

## Nächste Schritte

→ Entwickle neue Funktionen im Branch `develop`, merge nach `testing`, dann nach `main`.
