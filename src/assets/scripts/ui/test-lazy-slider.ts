document.addEventListener('DOMContentLoaded', () => {
  const galleryController = document.getElementById(
    'desktop-gallery-controller',
  )
  if (galleryController) {
    // Başlangıçta data-active'i 0 yap
    galleryController.setAttribute('data-active', '0')

    // Tüm sliderları disable yap
    for (let i = 1; i <= 4; i++) {
      const slider = document.getElementById(`slider-${i}-desktop`)
      if (slider) {
        slider.setAttribute('data-status', 'disable')
      }
    }
  }
})

// E tuşu ile slider değiştirme
document.addEventListener('keydown', event => {
  if (event.key === 'e') {
    const galleryController = document.getElementById(
      'desktop-gallery-controller',
    )
    if (galleryController) {
      // Mevcut aktif slider'ı al
      const currentActive = parseInt(
        galleryController.getAttribute('data-active') || '0',
      )

      // Önceki aktif slider'ı disable yap (eğer varsa)
      if (currentActive > 0) {
        const currentSlider = document.getElementById(
          `slider-${currentActive}-desktop`,
        )
        if (currentSlider) {
          currentSlider.setAttribute('data-status', 'disable')
        }
      }

      // Yeni aktif slider'ı belirle (1-4 arasında döngü)
      const newActive = currentActive >= 4 ? 0 : currentActive + 1

      // Gallery controller'ın data-active'ini güncelle
      galleryController.setAttribute('data-active', newActive.toString())

      // Yeni slider'ı enable yap (eğer 0 değilse)
      if (newActive > 0) {
        const newSlider = document.getElementById(`slider-${newActive}-desktop`)
        if (newSlider) {
          newSlider.setAttribute('data-status', 'enable')
        }
      }
    }
  }
})
