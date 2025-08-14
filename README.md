# HTML Template SE

Dieses Repository dient als Basisstruktur für das GitHub CI/CD Template `html-template-se`. Enthalten sind ein einfacher Dark-Mode-Button mit HTML/CSS/JS, Linting- und Formatierungs-Skripte für HTML, CSS und JavaScript sowie ein automatisches Deployment einer Preview mittels GitHub Actions.

## Features

- Einfacher Dark-Mode-Button mit HTML/CSS/JS
- Linting- und Formatierungs-Skripte für HTML, CSS und JavaScript
- Automatisches Deployment einer Preview via GitHub Actions

## Installation

Zur Installation des Templates auf macOS/Linux:

```bash
git clone <repo>
cd html-template-se
npm install
```

## Lokaler Start

Um die Demo lokal zu starten, kannst du einfach die `index.html` im Browser öffnen. Für Linting-Prüfungen nutze `npm run lint`. Die Dokumentation kann mit `node scripts/generate-docs.mjs` generiert werden, wodurch die README in den `docs/`-Ordner kopiert wird.

## Nutzung

1. Öffne `index.html` im Browser, um die Demo zu sehen.
2. Führe Linting-Prüfungen mit `npm run lint` durch.
3. Generiere die Dokumentation mit `node scripts/generate-docs.mjs`.

## CI/CD

Die GitHub Actions Workflow-Datei `.github/workflows/preview.yml` führt Linting aus und veröffentlicht eine GitHub Pages Preview.

## Ordnerstruktur

Die wichtigsten Ordner und Dateien sind wie folgt strukturiert:

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

## Contribution

Für Beiträge folge dem Entwicklungsprozess: neue Funktionen im Branch `develop` entwickeln, dann mergen nach `testing` und schließlich nach `main`.

## Lizenz

Dieses Projekt steht unter der MIT License. Weitere Details in [LICENSE](LICENSE).
