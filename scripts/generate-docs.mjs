import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

// -----------------------------
// CLI-Args & Konfiguration
// -----------------------------
const args = process.argv.slice(2)
const CWD = process.cwd()
const docsDir = path.join(CWD, 'docs')
const configPath = path.join(docsDir, 'docs-config.json')

// Flags
const WANT_WIKI = args.includes('wiki') || args.includes('--wiki')
const WANT_ALL = args.includes('--all')
const WANT_USER_ONLY = args.includes('--user-only')

// Defaults + optional Config
let config = { includeTemplate: true, templateDirs: [] }
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  } catch {
    console.warn('Could not parse docs-config.json – using defaults')
  }
}

// Template-Handling
let includeTemplate = config.includeTemplate
if (WANT_ALL) includeTemplate = true
if (WANT_USER_ONLY) includeTemplate = false
const templateDirs = config.templateDirs || []

// -----------------------------
// Helpers
// -----------------------------
const EXCLUDES = [
  'node_modules',
  '.git',
  '.github/.cache',
  'dist',
  'build',
  '.next',
  '.vercel',
  'coverage',
  'docs/wiki', // Wiki wird ja generiert – nicht in Kontext packen
  '.DS_Store',
]

function isExcluded(relPath) {
  return EXCLUDES.some((p) => relPath === p || relPath.startsWith(p + path.sep))
}

function safeStat(p) {
  try {
    return fs.statSync(p)
  } catch {
    return null
  }
}

function listDirLong(dir) {
  const out = []
  let entries = []
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return ''
  }
  for (const entry of entries) {
    const fp = path.join(dir, entry.name)
    const st = safeStat(fp)
    if (!st) continue
    const type = entry.isDirectory() ? 'd' : '-'
    const size = String(st.size).padStart(8)
    const mtime = st.mtime.toISOString()
    out.push(`${type} ${size} ${mtime} ${entry.name}`)
  }
  return out.join('\n')
}

function collectFiles(dir, out = [], base = CWD) {
  let entries = []
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    const rel = path.relative(base, full)

    if (isExcluded(rel)) continue
    if (!includeTemplate && templateDirs.some((t) => rel.startsWith(t))) {
      continue
    }

    const st = safeStat(full)
    if (!st) continue

    if (entry.isDirectory()) {
      collectFiles(full, out, base)
    } else {
      out.push(rel)
    }
  }
  return out
}

function safeRead(file, maxLines = null) {
  try {
    let txt = fs.readFileSync(file, 'utf8')
    if (maxLines != null) {
      txt = txt.split('\n').slice(0, maxLines).join('\n')
    }
    return txt
  } catch {
    return ''
  }
}

// -----------------------------
// Vorbereitungen
// -----------------------------
fs.mkdirSync(docsDir, { recursive: true })

// README-Kopie für Doku-Referenz
const srcReadme = path.join(CWD, 'README.md')
if (fs.existsSync(srcReadme)) {
  fs.copyFileSync(srcReadme, path.join(docsDir, 'README.md'))
}

// Repo-Tree (Top-Level)
const repoTree = listDirLong(CWD)

// Git-Log (ohne extra Dependencies)
let gitLog = ''
try {
  gitLog = execSync("git log -n 20 --pretty=format:'%h %s'", { encoding: 'utf8' })
} catch {
  gitLog = ''
}

// Datei-Liste (rekursiv, sortiert, mit Excludes)
const files = collectFiles(CWD).sort().join('\n')

// README-Snippet (erste 350 Zeilen)
const readmeSnippet = safeRead('README.md', 350)

// Kontext zusammenstellen
let context = [
  '## REPO TREE',
  repoTree.trim(),
  '',
  '## GIT LOG (last 20)',
  gitLog.trim(),
  '',
  '## FILE LIST (recursive)',
  files,
  '',
  '## README (existing, first 350 lines)',
  readmeSnippet.trim(),
  '',
].join('\n')

// Kontext-Limit (ca. 200 KB), um API-400er zu vermeiden
const MAX_CONTEXT_BYTES = 200 * 1024
if (Buffer.byteLength(context, 'utf8') > MAX_CONTEXT_BYTES) {
  // Hart abschneiden am Zeilengrenzer
  const lines = context.split('\n')
  const acc = []
  let size = 0
  for (const line of lines) {
    const add = Buffer.byteLength(line + '\n', 'utf8')
    if (size + add > MAX_CONTEXT_BYTES) break
    acc.push(line)
    size += add
  }
  acc.push('', '...[truncated due to size limit]...')
  context = acc.join('\n')
}

// Persistieren
fs.writeFileSync('repo_context.txt', context)
console.log(`Context written to repo_context.txt (${Buffer.byteLength(context, 'utf8')} bytes)`)

// -----------------------------
// Wiki-Generierung
// -----------------------------
function extractComments(filePaths) {
  const comments = []
  for (const file of filePaths) {
    if (!fs.existsSync(file)) continue
    const content = safeRead(file)
    for (const line of content.split('\n')) {
      const m = line.match(/\s*\/\/\s?(.*)/)
      if (m) comments.push(m[1].trim())
    }
  }
  return comments
}

function buildWiki() {
  const wikiDir = path.join(docsDir, 'wiki')
  fs.mkdirSync(wikiDir, { recursive: true })

  // package.json laden
  let pkg = {}
  try {
    pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  } catch {}

  // Kommentare aus JS-Dateien (erweiterbar)
  const jsFiles = ['index.js'] // hier bei Bedarf ergänzen
  const comments = extractComments(jsFiles)
  const commentBlock = comments.map((c) => `> ${c}`).join('\n')

  // Scripts-Tabelle
  const scriptsTable =
    Object.entries(pkg.scripts || {})
      .map(([k, v]) => `| \`${k}\` | ${v} |`)
      .join('\n') || '| (keine) | - |'

  // Architektur-Tabelle
  const architectureTable = [
    '| Datei | Beschreibung |',
    '|---|---|',
    '| `index.html` | Einstieg & Markup |',
    '| `index.css` | Basis-Styling |',
    '| `index.js` | Theme-Toggle-Logik |',
  ].join('\n')

  // CI/CD-Workflows dynamisch einlesen
  const workflowDir = path.join(CWD, '.github', 'workflows')
  const cicdRows = []
  if (fs.existsSync(workflowDir)) {
    for (const file of fs.readdirSync(workflowDir)) {
      if (file.endsWith('.yml') || file.endsWith('.yaml')) {
        cicdRows.push(`| \`${file}\` | Workflow-Datei |`)
      }
    }
  }
  const cicdTable = [
    '| Workflow | Beschreibung |',
    '|---|---|',
    ...(cicdRows.length ? cicdRows : ['| (keiner) | - |']),
  ].join('\n')

  // Inhalte
  const homeContent = `# Wiki – ${pkg.name || ''}

${pkg.description || ''}

| Metadatum | Wert |
|---|---|
| Version | ${pkg.version || '0.0.0'} |
| Kommentarzeilen | ${comments.length} |

${commentBlock}

## Architektur
${architectureTable}

<span style="color:green">Dieses Wiki wird automatisch aus dem Code erzeugt.</span>

## Kapitel
- [[Installation]]
- [[Usage]]
- [[CI-CD]]
- [[Contributing]]
`

  const installContent = `# Installation ⚙️

| Befehl | Zweck |
|---|---|
| \`npm install\` | Dependencies installieren |
| \`npm run lint\` | Linting ausführen |

<span style="color:orange">Tipp:</span> Node.js \\>= 20 verwenden.
`

  const usageJs = fs.existsSync('index.js')
    ? safeRead('index.js').trim()
    : '// (keine index.js gefunden)'
  const usageContent = `# Usage ▶️

## Skripte
${scriptsTable}

### Theme-Toggle Beispiel

\`\`\`js
${usageJs}
\`\`\`
`

  const cicdContent = `# CI/CD 🤖

${cicdTable}

<span style="color:purple">Automatisierte Abläufe sorgen für Qualität.</span>
`

  const contribContent = `# Contributing 🤝

1. Fork & Branch anlegen
2. Tests/Linter laufen lassen
3. Pull Request erstellen

<span style="color:blue">Bitte Prettier und ESLint beachten.</span>
`

  // Schreiben
  fs.writeFileSync(path.join(wikiDir, 'Home.md'), homeContent)
  fs.writeFileSync(path.join(wikiDir, 'Installation.md'), installContent)
  fs.writeFileSync(path.join(wikiDir, 'CI-CD.md'), cicdContent)
  fs.writeFileSync(path.join(wikiDir, 'Usage.md'), usageContent)
  fs.writeFileSync(path.join(wikiDir, 'Contributing.md'), contribContent)

  // evtl. Platzhalter entfernen
  const gitkeep = path.join(wikiDir, '.gitkeep')
  if (fs.existsSync(gitkeep)) fs.unlinkSync(gitkeep)

  console.log('Wiki pages written to docs/wiki')
}

// Ausführung
if (WANT_WIKI) {
  buildWiki()
}
