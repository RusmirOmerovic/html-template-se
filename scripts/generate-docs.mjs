import fs from 'node:fs'
import path from 'node:path'

const src = path.join(process.cwd(), 'README.md')
const destDir = path.join(process.cwd(), 'docs')
const dest = path.join(destDir, 'README.md')

fs.mkdirSync(destDir, { recursive: true })
fs.copyFileSync(src, dest)
console.log('Documentation copied to docs/README.md')
