// Toggle between light and dark mode by adding/removing the "dark" class on
// the body element and updating the theme indicator text.

const themeIndicator = document.getElementById('theme-indicator')
const toggleBtn = document.getElementById('toggle-btn')
let isDarkMode = false
toggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode
  document.body.classList.toggle('dark', isDarkMode)
  themeIndicator.textContent = `Current Theme: ${isDarkMode ? 'Dark' : 'Light'}`
})
