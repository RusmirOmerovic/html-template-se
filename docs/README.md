# HTML Template SE

Dieses Repository dient als Basisstruktur für das GitHub-CI/CD-Template `html-template-se`. Es enthält einen einfachen Dark-Mode-Button mit HTML/CSS/JS, Linting- und Formatierungsskripte für HTML, CSS und JavaScript sowie ein automatisches Deployment einer Vorschau mittels GitHub Actions.

## Features

- Einfacher Dark-Mode-Button mit HTML/CSS/JS
- Linting- und Formatierungsskripte für HTML, CSS und JavaScript
- Automatisches Deployment einer Vorschau über GitHub Actions

## Installation (macOS/Linux)

Um das Template auf macOS/Linux zu installieren, führe folgende Schritte aus:

```bash
git clone <repo>
cd html-template-se
npm install
```

## Lokaler Start

Öffne für den lokalen Start der Demo einfach die `index.html` im Browser. Führe Linting-Prüfungen mit `npm run lint` durch. Die Dokumentation kann mit `node scripts/generate-docs.mjs` generiert werden, wodurch die README in den `docs/`-Ordner kopiert wird.

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

Für Beiträge folge dem Entwicklungsprozess: Entwickle neue Funktionen im Branch `develop`, merge dann nach `testing` und schließlich nach `main`.

## Lizenz

Dieses Projekt steht unter der MIT-Lizenz. Weitere Details in [LICENSE](LICENSE).
