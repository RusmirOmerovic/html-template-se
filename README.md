# html-template-se (develop)

Dieses Repository dient als Basisstruktur für das GitHub CI/CD Template `html-template-se`.

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

## Lokaler Start

### Ohne Docker

Öffne `index.html` im Browser, um die Demo zu sehen.
Führe das Linting aus mit `npm run lint`.
Um die Dokumentation zu generieren, verwende `node scripts/generate-docs.mjs`.

### Mit Docker

Um die Anwendung in einem Docker-Container zu starten, führe `docker-compose up` aus.

## Nutzung mit Beispielen

Nach der Installation:

- Öffne `index.html` im Browser, um die Demo zu sehen.
- Führe das Linting aus mit `npm run lint`.
- Generiere die Dokumentation mit `node scripts/generate-docs.mjs`.

## CI/CD

Der GitHub Actions Workflow `.github/workflows/preview.yml` führt Linting aus und veröffentlicht eine GitHub Pages Preview.

## Ordnerstruktur

```
.
├── docs/                # Generierte Dokumentation
├── scripts/             # Hilfsskripte
├── index.html           # Startseite
├── index.css            # Styles
├── index.js             # JS-Logik (Dark-Mode-Toggle)
├── .github/workflows/   # CI/CD Workflows
└── ...
```

## Beitrag

Fühle dich frei, neue Funktionen im `develop` Branch zu entwickeln, diese in `testing` zu mergen und schließlich in `main` zu veröffentlichen.

## Lizenz

Dieses Projekt steht unter der MIT License. Weitere Details in [LICENSE](LICENSE).
