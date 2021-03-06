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
  const images = document.querySelectorAll('img[data-image-viewer]')

  images.forEach(v => {
    console.log(v)
    v.onclick = () => {
      alert('hi')
    }
  })
})

if (darkMode) {
  document.documentElement.classList.add('dark')
}