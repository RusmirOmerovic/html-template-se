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
let repoTree = ''
let gitLog = ''
try {
  repoTree = execSync('ls -la', { encoding: 'utf8' })
  gitLog = execSync('git --no-pager log --oneline -n 20 || true', { encoding: 'utf8' })
} catch {}

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
