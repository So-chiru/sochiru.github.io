window.darkMode = false

const openURL = link => {
  location.href = link
}

const openNewTab = link => {
  window.open(link, '_blank')
}

const hideImage = ev => {
  console.log(ev)
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('')
})

if (darkMode) {
  document.documentElement.classList.add('dark')
}