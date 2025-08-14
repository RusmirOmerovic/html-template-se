# html-template-se 📘

## 🔍 Überblick
HTML/CSS/JS Template mit automatischen Linter- und Formatierungs-Checks

## ✨ Features
### 💬 Kommentare
- index.js: change the text "current theme: light" into "current theme: dark"

### 📤 Exportierte Funktionen
- Keine exportierten Funktionen gefunden

### 📦 Abhängigkeiten
```json
{
  "eslint": "8.57.1",
  "eslint-config-standard": "17.1.0",
  "eslint-plugin-import": "2.29.1",
  "eslint-plugin-n": "16.6.2",
  "eslint-plugin-promise": "6.4.0",
  "htmlhint": "1.6.3",
  "prettier": "3.6.2",
  "stylelint": "16.23.1",
  "stylelint-config-recommended": "14.0.1",
  "stylelint-config-standard": "36.0.1"
}
```


## 📦 Installation
```bash
npm install
```


## 🚀 Nutzung
```bash
# lint:html
npm run lint:html
# lint:css
npm run lint:css
# lint:js
npm run lint:js
# lint
npm run lint
# fmt
npm run fmt
# fmt:check
npm run fmt:check
# test
npm run test
# docs:readme
npm run docs:readme
```

## 📁 Ordnerstruktur
```text
__tests__/
  example.spec.js
.dockerignore
.eslintignore
.eslintrc.json
.github/
  workflows/
    ci.yml
    docs.yml
    preview.yml
.gitignore
.htmlhintrc
.prettierignore
.prettierrc
.stylelintignore
.stylelintrc.json
docker-compose.yml
Dockerfile
docs/
  wiki/
    .gitkeep
index.css
index.html
index.js
package-lock.json
package.json
README.md
scripts/
  generate-docs.mjs
```

## ⚙️ CI/CD
- ci.yml
- docs.yml
- preview.yml

## 🤝 Beitragshinweise
Beiträge sind willkommen! Bitte Issues oder Pull Requests stellen.

## 📄 Lizenz
Keine Lizenz angegeben.
