/**
 * @jest-environment jsdom
 */

test('toggles dark mode on button click', () => {
  document.body.innerHTML = `
    <button id="toggle-btn">Toggle Theme</button>
    <div id="theme-indicator">Current Theme: Light</div>
  `

  // Require script after DOM setup to attach event listener
  require('../index.js')

  const button = document.getElementById('toggle-btn')
  button.click()

  expect(document.body.classList.contains('dark')).toBe(true)
  expect(document.getElementById('theme-indicator').textContent).toBe('Current Theme: Dark')
})
