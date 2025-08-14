import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const args = process.argv.slice(2)

// Load docs configuration
const configPath = path.join(process.cwd(), 'docs', 'docs-config.json')
let config = { includeTemplate: true, templateDirs: [] }
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
  } catch {
    console.warn('Could not parse docs-config.json – using defaults')
  }
}

// Determine whether template directories should be included
let includeTemplate = config.includeTemplate
if (args.includes('--all')) includeTemplate = true
if (args.includes('--user-only')) includeTemplate = false

const templateDirs = config.templateDirs || []

// Helper to collect file list
function collectFiles(dir, out = [], base = process.cwd()) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    const rel = path.relative(base, full)
    if (!includeTemplate && templateDirs.some((t) => rel.startsWith(t))) {
      continue
    }
    if (entry.isDirectory()) {
      collectFiles(full, out, base)
    } else {
      out.push(rel)
    }
  }
  return out
}

// Copy existing README into docs/ for reference
const srcReadme = path.join(process.cwd(), 'README.md')
const docsDir = path.join(process.cwd(), 'docs')
fs.mkdirSync(docsDir, { recursive: true })
if (fs.existsSync(srcReadme)) {
  fs.copyFileSync(srcReadme, path.join(docsDir, 'README.md'))
}

// Build repository context similar to previous workflow step
function listDirLong(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  return entries
    .map((entry) => {
      const stats = fs.statSync(path.join(dir, entry.name))
      const type = entry.isDirectory() ? 'd' : '-'
      const size = stats.size.toString().padStart(8)
      const mtime = stats.mtime.toISOString()
      return `${type} ${size} ${mtime} ${entry.name}`
    })
    .join('\n')
}

const repoTree = listDirLong(process.cwd())

let gitLog = ''
try {
  const { default: simpleGit } = await import('simple-git')
  const git = simpleGit()
  const log = await git.log({ n: 20 })
  gitLog = log.all.map((c) => `${c.hash.substring(0, 7)} ${c.message}`).join('\n')
} catch {
  // git or simple-git not available
}

const files = collectFiles(process.cwd()).sort().join('\n')

let readmeSnippet = ''
if (fs.existsSync('README.md')) {
  try {
    readmeSnippet = execSync("sed -n '1,350p' README.md", { encoding: 'utf8' })
  } catch {}
}

const context = [
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

fs.writeFileSync('repo_context.txt', context)
console.log('Context written to repo_context.txt')

// --- Wiki generation -------------------------------------------------------

/**
 * Extract single line comments from the given files.
 * Currently supports "//" comments in JS files.
 * @param {string[]} filePaths
 * @returns {string[]}
 */
function extractComments(filePaths) {
  const comments = []
  for (const file of filePaths) {
    if (!fs.existsSync(file)) continue
    const content = fs.readFileSync(file, 'utf8')
    for (const line of content.split('\n')) {
      const m = line.match(/\s*\/\/\s?(.*)/)
      if (m) comments.push(m[1].trim())
    }
  }
  return comments
}

/**
 * Build simple developer wiki based on package metadata and code comments.
 * Generated pages: Home, Installation, CI-CD, Usage, Contributing.
 */
function buildWiki() {
  const wikiDir = path.join(docsDir, 'wiki')
  fs.mkdirSync(wikiDir, { recursive: true })

  // Load package metadata
  let pkg = {}
  try {
    pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  } catch {}

  const comments = extractComments(['index.js'])
  const commentBlock = comments.map((c) => `> ${c}`).join('\n')

  const scriptsTable = Object.entries(pkg.scripts || {})
    .map(([k, v]) => `| \`${k}\` | ${v} |`)
    .join('\n')

  const architectureTable = [
    '| Datei | Beschreibung |',
    '|---|---|',
    '| `index.html` | Einstieg & Markup |',
    '| `index.css` | Basis-Styling |',
    '| `index.js` | Theme-Toggle-Logik |',
  ].join('\n')

  const homeContent = `# Wiki – ${pkg.name || ''}\n\n${pkg.description || ''}\n\n| Metadatum | Wert |\n|---|---|\n| Version | ${
    pkg.version || '0.0.0'
  } |\n| Kommentarzeilen | ${comments.length} |\n\n${commentBlock}\n\n## Architektur\n${architectureTable}\n\n<span style="color:green">Dieses Wiki wird automatisch aus dem Code erzeugt.</span>\n\n## Kapitel\n- [[Installation]]\n- [[Usage]]\n- [[CI-CD]]\n- [[Contributing]]\n`

  const installContent = `# Installation ⚙️\n\n| Befehl | Zweck |\n|---|---|\n| \`npm install\` | Dependencies installieren |\n| \`npm run lint\` | Linting ausführen |\n\n<span style="color:orange">Tipp:</span> Node.js \>= 20 verwenden.\n`

  const cicdTable = [
    '| Workflow | Beschreibung |',
    '|---|---|',
    '| `ci.yml` | Linting und Tests |',
    '| `preview.yml` | Docker-Preview |',
    '| `docs.yml` | Doku-Automatisierung |',
  ].join('\n')

  const cicdContent = `# CI/CD 🤖\n\n${cicdTable}\n\n<span style="color:purple">Automatisierte Abläufe sorgen für Qualität.</span>\n`

  const usageContent = `# Usage ▶️\n\n## Skripte\n${scriptsTable}\n\n### Theme-Toggle Beispiel\n\n\`\`\`js\n${fs
    .readFileSync('index.js', 'utf8')
    .trim()}\n\`\`\`\n`

  const contribContent = `# Contributing 🤝\n\n1. Fork & Branch anlegen\n2. Tests/Linter laufen lassen\n3. Pull Request erstellen\n\n<span style="color:blue">Bitte Prettier und ESLint beachten.</span>\n`

  fs.writeFileSync(path.join(wikiDir, 'Home.md'), homeContent)
  fs.writeFileSync(path.join(wikiDir, 'Installation.md'), installContent)
  fs.writeFileSync(path.join(wikiDir, 'CI-CD.md'), cicdContent)
  fs.writeFileSync(path.join(wikiDir, 'Usage.md'), usageContent)
  fs.writeFileSync(path.join(wikiDir, 'Contributing.md'), contribContent)
  // remove empty placeholder if present
  const gitkeep = path.join(wikiDir, '.gitkeep')
  if (fs.existsSync(gitkeep)) fs.unlinkSync(gitkeep)
}

if (args.includes('wiki')) {
  buildWiki()
  console.log('Wiki pages written to docs/wiki')
}
