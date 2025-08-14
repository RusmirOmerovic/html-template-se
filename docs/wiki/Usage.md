# Usage ▶️

## Skripte
| `lint:html` | htmlhint . |
| `lint:css` | stylelint "**/*.css" |
| `lint:js` | eslint . --max-warnings=0 |
| `lint` | npm run lint:html && npm run lint:css && npm run lint:js |
| `fmt` | prettier -w . |
| `fmt:check` | prettier --check . |
| `test` | echo "(placeholder for future tests)" && exit 0 |
| `docs:wiki` | node scripts/generate-docs.mjs wiki |

### Theme-Toggle Beispiel

```js
// change the text "current theme: light" into "current theme: dark"

const themeIndicator = document.getElementById('theme-indicator')
const toggleBtn = document.getElementById('toggle-btn')
let isDarkMode = false
toggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode
  document.body.classList.toggle('dark-mode', isDarkMode)
  themeIndicator.textContent = `Current Theme: ${isDarkMode ? 'Dark' : 'Light'}`
  document.body.classList.toggle('dark')
})
```
