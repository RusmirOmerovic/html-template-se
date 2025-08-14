import fs from 'node:fs/promises';
import fssync from 'node:fs';
import path from 'node:path';

const rootDir = '.';

async function readPackageJson() {
  const data = await fs.readFile(path.join(rootDir, 'package.json'), 'utf8');
  return JSON.parse(data);
}

function extractFromFile(filePath) {
  const content = fssync.readFileSync(filePath, 'utf8');
  const ext = path.extname(filePath);
  let comments = [];
  let exports = [];
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
    comments = content.match(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g) || [];
    exports = content.match(/export\s+(?:default\s+)?(?:function|const|class|let|var)|module\.exports\s*=|exports\.[\w]+/g) || [];
  } else if (ext === '.css') {
    comments = content.match(/\/\*[\s\S]*?\*\//g) || [];
  } else if (ext === '.html') {
    comments = content.match(/<!--([\s\S]*?)-->/g) || [];
  }
  return { comments, exports };
}

function cleanComment(comment) {
  return comment
    .replace(/^<!--|-->$/g, '')
    .replace(/^\/\//, '')
    .replace(/^\/\*/, '')
    .replace(/\*\/$/, '')
    .trim();
}

function generateTree(dir, prefix = '') {
  const exclude = new Set(['node_modules', '.git']);
  const entries = fssync
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => !exclude.has(e.name))
    .sort((a, b) => a.name.localeCompare(b.name));
  const lines = [];
  for (const entry of entries) {
    const line = prefix + entry.name + (entry.isDirectory() ? '/' : '');
    lines.push(line);
    if (entry.isDirectory()) {
      lines.push(
        generateTree(path.join(dir, entry.name), prefix + '  ')
      );
    }
  }
  return lines.join('\n');
}

async function main() {
  const pkg = await readPackageJson();
  const { name, description, scripts = {}, dependencies = {}, devDependencies = {} } = pkg;

  const files = ['index.html', 'index.js', 'index.css', '__tests__/example.spec.js'];
  const commentsData = [];
  const exportsData = [];

  for (const file of files) {
    if (!fssync.existsSync(file)) continue;
    const { comments, exports } = extractFromFile(file);
    comments.forEach((c) => commentsData.push({ file, comment: cleanComment(c) }));
    exports.forEach((e) => exportsData.push({ file, exp: e.trim() }));
  }

  const tree = generateTree(rootDir);

  let workflows = [];
  try {
    workflows = await fs.readdir('.github/workflows');
  } catch {
    workflows = [];
  }

  const lines = [];
  lines.push(`# ${name} 📘`);
  lines.push('');
  lines.push(`## 🔍 Überblick`);
  lines.push(`${description}`);
  lines.push('');

  lines.push(`## ✨ Features`);
  lines.push(`### 💬 Kommentare`);
  if (commentsData.length) {
    for (const { file, comment } of commentsData) {
      lines.push(`- ${file}: ${comment}`);
    }
  } else {
    lines.push('- Keine Kommentare gefunden');
  }
  lines.push('');
  lines.push(`### 📤 Exportierte Funktionen`);
  if (exportsData.length) {
    for (const { file, exp } of exportsData) {
      lines.push(`- ${file}: \`${exp}\``);
    }
  } else {
    lines.push('- Keine exportierten Funktionen gefunden');
  }
  lines.push('');
  lines.push('### 📦 Abhängigkeiten');
  const allDeps = { ...dependencies, ...devDependencies };
  if (Object.keys(allDeps).length) {
    lines.push('```json');
    lines.push(JSON.stringify(allDeps, null, 2));
    lines.push('```');
  } else {
    lines.push('Keine Abhängigkeiten angegeben');
  }
  lines.push('');

  lines.push(`## 📦 Installation`);
  lines.push('```bash');
  lines.push('npm install');
  lines.push('```');
  lines.push('');

  lines.push(`## 🚀 Nutzung`);
  lines.push('```bash');
  for (const [name, cmd] of Object.entries(scripts)) {
    lines.push(`# ${name}`);
    lines.push(`npm run ${name}`);
  }
  lines.push('```');
  lines.push('');

  lines.push(`## 📁 Ordnerstruktur`);
  lines.push('```text');
  lines.push(tree);
  lines.push('```');
  lines.push('');

  lines.push(`## ⚙️ CI/CD`);
  if (workflows.length) {
    for (const wf of workflows) {
      lines.push(`- ${wf}`);
    }
  } else {
    lines.push('- Keine Workflows gefunden');
  }
  lines.push('');

  lines.push(`## 🤝 Beitragshinweise`);
  lines.push('Beiträge sind willkommen! Bitte Issues oder Pull Requests stellen.');
  lines.push('');

  lines.push(`## 📄 Lizenz`);
  lines.push('Keine Lizenz angegeben.');
  lines.push('');

  await fs.writeFile('README.md', lines.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});