function initializeAccordions(): void {
  // Kartları seç ve her birine benzersiz ID ata
  const cards = document.querySelectorAll('.tour-card')
  cards.forEach((card, cardIndex) => {
    // Kart toggle düğmesini güncelle
    const cardToggle = card.querySelector(
      'input.accordion-toggle',
    ) as HTMLInputElement
    const cardLabel = card.querySelector(
      'label[for="cardToggle"]',
    ) as HTMLLabelElement

    if (cardToggle && cardLabel) {
      const cardId = `card-toggle-${cardIndex}`
      cardToggle.id = cardId
      cardLabel.setAttribute('for', cardId)
    }

    // Bölümleri güncelle
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

function calculateHeights(): void {
  // Accordion yüksekliklerini hesapla
  const accordions = document.querySelectorAll('.accordion-section')
  accordions.forEach(accordion => {
    const content = accordion.querySelector('.accordion-content') as HTMLElement
    const inner = content?.querySelector('.accordion-inner') as HTMLElement
    if (inner) {
      const height = inner.scrollHeight
      accordion.setAttribute('style', `--content-height: ${height}px`)
    }
  })
  // Kart içeriği yüksekliğini hesapla
  const cards = document.querySelectorAll('.tour-card')
  cards.forEach(card => {
    const content = card.querySelector('.space-y-4') as HTMLElement
    if (content) {
      const height = content.scrollHeight
      content.parentElement?.setAttribute('style', `--card-height: ${height}px`)
    }
  })
}

// Sayfa yüklendiğinde her iki fonksiyonu da çalıştır
document.addEventListener('DOMContentLoaded', () => {
  initializeAccordions()
  calculateHeights()
})

let resizeTimer: number
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(calculateHeights, 100)
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
