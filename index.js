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
