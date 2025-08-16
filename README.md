# HTML-TEMPLATE-SE 🚀

Ein modernes HTML/CSS/JS Projekt-Template mit:

- Automatischem Linting & Formatting (ESLint, Stylelint, Prettier)
- Vollständiger CI/CD Pipeline (GitHub Actions)
- Docker & Compose Support
- Automatischer README- & Wiki-Generierung via OpenAI

---

## 📦 Features

- **Lint & Format**
  - HTML: `htmlhint`
  - CSS: `stylelint`
  - JS: `eslint`
  - Autoformat mit `prettier`
- **CI/CD**
  - Linting, Tests, Format-Checks
  - Automatische Doku-Generierung (README + Wiki)
- **Docker & Compose**
  - Lokaler Dev-Server
- **OpenAI Integration**
  - Automatische Dokumentation aus Code-Kommentaren

---

## 📂 Projektstruktur

```
HTML-TEMPLATE-SE/
├── docs/
│   └── wiki/                # Wiki-Seiten
│       └── _Sidebar.md      # Navigation
├── scripts/
│   ├── ai-readme.sh         # Generiert README
│   └── generate-docs.mjs    # Kontext & Wiki-Generator
├── .github/
│   └── workflows/
│       ├── ci.yml           # CI-Pipeline
│       ├── docs.yml         # Doku-Generierung
│       └── preview.yml      # Optionaler Preview-Flow
├── package.json
├── Dockerfile
└── docker-compose.yml
```

---

## ⚙️ Einrichtung

### 1. Repository klonen

```bash
git clone https://github.com/<username>/html-template-se.git
cd html-template-se
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Secrets setzen

Unter **Settings → Secrets and variables → Actions**:

- `OPENAI_API_KEY` → Dein OpenAI API Key
- `GITHUB_TOKEN` (Standard vorhanden)

Optional für Cross-Repo:

- `GH_PAT` → Personal Access Token mit `repo`-Rechten

### 4. Docker (optional)

```bash
docker compose up --build
```

---

## 🛠️ CI/CD Pipelines

### `ci.yml`

- Lint-Checks
- Format-Checks
- Optional Tests

### `docs.yml`

- Trigger: Push auf `main` oder manuell
- Generiert README via OpenAI
- Baut Wiki aus Code-Kommentaren
- Formatiert und pusht Änderungen
- Erstellt PR bei README-Änderungen
- Hard-Overwrite der Wiki-Seiten

### `preview.yml` (optional)

- Preview-Doku für Feature-Branches

---

## 📖 Nutzung

### Lint & Format

```bash
npm run lint        # Alle Lints
npm run fmt         # Autoformat
npm run fmt:check   # Nur prüfen
```

### Doku-Generierung manuell starten

```bash
gh workflow run docs.yml -f force_refresh=true
```

---

## 🔧 Anpassungen für Nutzer

- **Sidebar bearbeiten**  
  Datei `docs/wiki/_Sidebar.md` editieren, um Navigationsstruktur zu ändern.
- **OpenAI Prompt erweitern**  
  In `scripts/ai-readme.sh` den Prompt anpassen, um detailliertere Beschreibungen zu erzeugen.
- **CI/CD anpassen**  
  Workflows unter `.github/workflows` bearbeiten.

---

## 🤖 OpenAI Prompt-Erweiterung

Der Prompt in `ai-readme.sh` kann erweitert werden, um z. B. technische Details, Codebeispiele oder Projektvisionen automatisch zu generieren.

Beispiel:

```bash
PROMPT="Erstelle ein README mit Fokus auf Deployments, Security Best Practices und Code-Beispielen."
```

---

## 🧩 Branch-Strategie

- **main** → Produktion
- **feature/** → Entwicklung neuer Features
- **develop/testing** (optional) → Preview-Deployments

---

## 🏆 Fazit

Mit **HTML-TEMPLATE-SE** hast du eine solide, CI/CD-gestützte Projektbasis, die sich automatisch dokumentiert.  
Einfach forken, API-Key setzen und loslegen! 🚀
