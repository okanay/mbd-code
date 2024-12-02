export class AccordionManager {
  private readonly accordions: HTMLElement[]
  private resizeObserver: ResizeObserver

  constructor() {
    this.accordions = Array.from(document.querySelectorAll('.tour-card'))
    this.resizeObserver = new ResizeObserver(entries =>
      this.handleResize(entries),
    )
    this.init()
  }

  private init(): void {
    this.setupAccordions()
    this.observeElements()
  }

  private setupAccordions(): void {
    this.accordions.forEach((accordion, index) => {
      const uniqueId = `tour-${Date.now()}-${index}`

      // Ana accordion setup
      const cardInput = accordion.querySelector(
        '.card-input',
      ) as HTMLInputElement
      const cardLabel = accordion.querySelector(
        '.card-label',
      ) as HTMLLabelElement

      if (cardInput && cardLabel) {
        cardInput.id = uniqueId
        cardLabel.htmlFor = uniqueId
      }

      // İç bölümler için setup
      const sections = accordion.querySelectorAll('.accordion-section')
      sections.forEach((section, sectionIndex) => {
        const sectionInput = section.querySelector(
          '.card-info-container-input',
        ) as HTMLInputElement
        const sectionLabel = section.querySelector(
          '.card-info-container-label',
        ) as HTMLLabelElement

        if (sectionInput && sectionLabel) {
          const sectionId = `${uniqueId}-section-${sectionIndex}`
          sectionInput.id = sectionId
          sectionLabel.htmlFor = sectionId
        }

        // Her section için height observer ekle
        this.setupSectionObserver(section)
      })

      // Ana accordion için height observer
      this.setupAccordionObserver(accordion)
    })
  }

  private setupAccordionObserver(accordion: HTMLElement): void {
    const content = accordion.querySelector('.card-content') as HTMLElement
    if (!content) return

    // Height calculation için clone oluştur
    const cloneForCalculation = () => {
      const clone = content.cloneNode(true) as HTMLElement
      clone.style.position = 'absolute'
      clone.style.visibility = 'hidden'
      clone.style.height = 'auto'
      clone.style.maxHeight = 'none'
      clone.style.overflow = 'visible'
      document.body.appendChild(clone)

      const height = clone.offsetHeight
      document.body.removeChild(clone)
      return height
    }

    // Input değişikliğini dinle
    const input = accordion.querySelector('.card-input') as HTMLInputElement
    if (input) {
      input.addEventListener('change', () => {
        const realHeight = cloneForCalculation()
        accordion.style.setProperty('--card-height', `${realHeight}px`)
      })
    }

    // ResizeObserver ekle
    this.resizeObserver.observe(content)
  }

  private setupSectionObserver(section: Element): void {
    const content = section.querySelector('.accordion-content') as HTMLElement
    const inner = section.querySelector('.accordion-inner') as HTMLElement
    if (!content || !inner) return

    // Height calculation için clone oluştur
    const cloneForCalculation = () => {
      const clone = inner.cloneNode(true) as HTMLElement
      clone.style.position = 'absolute'
      clone.style.visibility = 'hidden'
      clone.style.height = 'auto'
      clone.style.maxHeight = 'none'
      clone.style.overflow = 'visible'
      document.body.appendChild(clone)

      const height = clone.offsetHeight
      document.body.removeChild(clone)
      return height
    }

    // Input değişikliğini dinle
    const input = section.querySelector(
      '.card-info-container-input',
    ) as HTMLInputElement
    if (input) {
      input.addEventListener('change', () => {
        const realHeight = cloneForCalculation()
        content.style.setProperty('--content-height', `${realHeight}px`)
      })
    }

    // ResizeObserver ekle
    this.resizeObserver.observe(inner)
  }

  private handleResize(entries: ResizeObserverEntry[]): void {
    entries.forEach(entry => {
      const element = entry.target as HTMLElement
      const isMainContent = element.classList.contains('card-content')
      const isInnerContent = element.classList.contains('accordion-inner')

      if (isMainContent) {
        const accordion = element.closest('.tour-card')
        const height = this.calculateRealHeight(element)
        if (accordion instanceof HTMLElement) {
          accordion.style.setProperty('--card-height', `${height}px`)
        }
      } else if (isInnerContent) {
        const section = element.closest('.accordion-section')
        const content = section?.querySelector(
          '.accordion-content',
        ) as HTMLElement
        const height = this.calculateRealHeight(element)
        content?.style.setProperty('--content-height', `${height}px`)
      }
    })
  }

  private calculateRealHeight(element: HTMLElement): number {
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.position = 'absolute'
    clone.style.visibility = 'hidden'
    clone.style.height = 'auto'
    clone.style.maxHeight = 'none'
    clone.style.overflow = 'visible'
    document.body.appendChild(clone)

    const height = clone.offsetHeight
    document.body.removeChild(clone)
    return height
  }

  private observeElements(): void {
    // MutationObserver ekle - dinamik içerik değişikliklerini yakala
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (
          mutation.type === 'childList' ||
          mutation.type === 'characterData' ||
          mutation.type === 'attributes'
        ) {
          this.updateHeights()
        }
      })
    })

    this.accordions.forEach(accordion => {
      observer.observe(accordion, {
        childList: true,
        subtree: true,
        characterData: true,
      })
    })
  }

  private updateHeights(): void {
    this.accordions.forEach(accordion => {
      const content = accordion.querySelector('.card-content') as HTMLElement
      if (content) {
        const height = this.calculateRealHeight(content)
        accordion.style.setProperty('--card-height', `${height}px`)
      }

      const sections = accordion.querySelectorAll('.accordion-section')
      sections.forEach(section => {
        const inner = section.querySelector('.accordion-inner') as HTMLElement
        const content = section.querySelector(
          '.accordion-content',
        ) as HTMLElement
        if (inner && content) {
          const height = this.calculateRealHeight(inner)
          content.style.setProperty('--content-height', `${height}px`)
        }
      })
    })
  }
}
