import fs from 'node:fs'
import path from 'node:path'

/**
 * Calculate line number from string index.
 * @param {string} str
 * @param {number} index
 * @returns {number}
 */
function lineNumber(str, index) {
  return str.slice(0, index).split('\n').length
}

/**
 * Extract comments from supported file types and map them to code elements.
 * Supports:
 * - JS: single- and multi-line (including JSDoc) comments with function/class names
 * - HTML: comments paired with the next element
 * - CSS: block comments placed before a selector
 * @param {string[]} filePaths
 * @returns {Record<string, {comments: Array<{line:number,text:string}>, blocks: Array<{name:string, comment:string}>}>}
 */
export function extractComments(filePaths) {
  const result = {}
  for (const file of filePaths) {
    if (!fs.existsSync(file)) continue
    const ext = path.extname(file).toLowerCase()
    const content = fs.readFileSync(file, 'utf8')
    const info = { comments: [], blocks: [] }

    if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
      // generic single line comments
      const single = /\/\/([^\n]*)/g
      let m
      while ((m = single.exec(content)) !== null) {
        info.comments.push({ line: lineNumber(content, m.index), text: m[1].trim() })
      }
      // generic multi line comments including JSDoc
      const multi = /\/\*[\s\S]*?\*\//g
      while ((m = multi.exec(content)) !== null) {
        const text = m[0]
          .replace(/^\/\*+|\*+\/$/g, '')
          .split('\n')
          .map((l) => l.replace(/^\s*\*\s?/, '').trim())
          .join('\n')
          .trim()
        info.comments.push({ line: lineNumber(content, m.index), text })
      }
      // JSDoc blocks mapped to next declaration
      const jsdoc = /\/\*\*([\s\S]*?)\*\/\s*(?:async\s*)?(?:function|class|const|let|var)\s+([\w$]+)/g
      while ((m = jsdoc.exec(content)) !== null) {
        const comment = m[1]
          .split('\n')
          .map((l) => l.replace(/^\s*\*\s?/, '').trim())
          .join('\n')
          .trim()
        const name = m[2]
        info.blocks.push({ name, comment })
      }
    } else if (ext === '.html') {
      const html = /<!--([\s\S]*?)-->\s*<([\w-]+)/g
      let m
      while ((m = html.exec(content)) !== null) {
        const comment = m[1].trim()
        const element = m[2]
        info.blocks.push({ name: element, comment })
      }
    } else if (ext === '.css') {
      const css = /\/\*([\s\S]*?)\*\/\s*([^\{]*)/g
      let m
      while ((m = css.exec(content)) !== null) {
        const comment = m[1]
          .split('\n')
          .map((l) => l.replace(/^\s*\*\s?/, '').trim())
          .join('\n')
          .trim()
        const selector = (m[2] || '').trim()
        if (selector) info.blocks.push({ name: selector, comment })
        else info.comments.push({ line: lineNumber(content, m.index), text: comment })
      }
    }

    if (info.comments.length || info.blocks.length) {
      result[file] = info
    }
  }
  return result
}
