# Usage ▶️

## Skripte

| `lint:html` | htmlhint . docs docs/wiki |
| `lint:css` | stylelint "**/\*.css" "docs/**/_.css" "docs/wiki/\*\*/_.css" |
| `lint:js` | eslint . docs docs/wiki --no-error-on-unmatched-pattern --max-warnings=0 |
| `lint` | npm run lint:html && npm run lint:css && npm run lint:js |
| `fmt` | prettier -w . |
| `fmt:check` | prettier --check . |
| `test` | echo "(placeholder for future tests)" && exit 0 |
| `docs:wiki` | node scripts/generate-docs.mjs wiki |

### Theme-Toggle Beispiel

```js
// Toggle between light and dark mode by adding/removing the "dark" class on
// the body element and updating the theme indicator text.

// Grab reference to the element displaying the active theme
const themeIndicator = document.getElementById('theme-indicator')
// Button that triggers the theme switch
const toggleBtn = document.getElementById('toggle-btn')
// Track current theme state
let isDarkMode = false
// React to user clicking the toggle button
toggleBtn.addEventListener('click', () => {
  // Flip the theme flag
  isDarkMode = !isDarkMode
  // Add/remove the CSS class controlling dark mode
  document.body.classList.toggle('dark', isDarkMode)
  // Update on-page text to reflect new theme
  themeIndicator.textContent = `Current Theme: ${isDarkMode ? 'Dark' : 'Light'}`
})
```
