function initializeAccordions(): void {
  // ID'leri otomatik oluştur
  const cards = document.querySelectorAll('.tour-card')

  cards.forEach((card, cardIndex) => {
    const sections = card.querySelectorAll('.accordion-section')

    sections.forEach((section, sectionIndex) => {
      const input = section.querySelector(
        'input[type="checkbox"]',
      ) as HTMLInputElement
      const label = section.querySelector('label') as HTMLLabelElement

      if (input && label) {
        const uniqueId = `accordion-${cardIndex}-${sectionIndex}`
        input.id = uniqueId
        label.setAttribute('for', uniqueId)
      }
    })
  })
}

function calculateAccordionHeights(): void {
  const accordions = document.querySelectorAll('.accordion-section')

  accordions.forEach(accordion => {
    const content = accordion.querySelector(
      '.accordion-content',
    ) as HTMLElement | null
    const inner = content?.querySelector(
      '.accordion-inner',
    ) as HTMLElement | null

    if (inner) {
      // Orijinal stilleri sakla
      const originalStyles = {
        position: inner.style.position,
        visibility: inner.style.visibility,
        zIndex: inner.style.zIndex,
      }

      // Ölçüm için geçici stiller
      Object.assign(inner.style, {
        position: 'absolute',
        visibility: 'hidden',
        zIndex: '-1',
      })

      // Yüksekliği hesapla
      const height = inner.scrollHeight

      // Orijinal stilleri geri yükle
      Object.assign(inner.style, originalStyles)

      // CSS değişkeni olarak ata
      ;(accordion as HTMLElement).style.setProperty(
        '--content-height',
        `${height}px`,
      )
    }
  })
}

// Sayfa yüklendiğinde her iki fonksiyonu da çalıştır
document.addEventListener('DOMContentLoaded', () => {
  initializeAccordions()
  calculateAccordionHeights()
})

// Resize event için debounce
let resizeTimer: number | undefined
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(calculateAccordionHeights, 100)
})

// MutationObserver ekleyerek dinamik içerik değişikliklerini yakala
const observer = new MutationObserver(() => {
  calculateAccordionHeights()
})

// Her kart için observer'ı başlat
document.querySelectorAll('.tour-card').forEach(card => {
  observer.observe(card, {
    childList: true,
    subtree: true,
    characterData: true,
  })
})
