interface FloatingButtonsElements {
  formContainerId: string
  completePurchaseContainer: string
  whatsappButton: string
}

interface AnimationOptions {
  active: Partial<CSSStyleDeclaration>
  exit: Partial<CSSStyleDeclaration>
}

interface ThresholdOptions {
  start: number
  end: number
}

interface FloatingButtonsOptions {
  threshold: ThresholdOptions
  animationOptions: AnimationOptions
  whatsappPositions: {
    default: Partial<CSSStyleDeclaration>
    shifted: Partial<CSSStyleDeclaration>
  }
}

class FloatingButtonsManager {
  private elements: FloatingButtonsElements
  private options: FloatingButtonsOptions
  private formContainer: HTMLElement | null
  private purchaseContainer: HTMLElement | null
  private whatsappButton: HTMLElement | null
  private isVisible: boolean

  constructor(config: {
    elements: FloatingButtonsElements
    options: FloatingButtonsOptions
  }) {
    this.elements = config.elements
    this.options = config.options
    this.formContainer = document.querySelector(this.elements.formContainerId)
    this.purchaseContainer = document.querySelector(
      this.elements.completePurchaseContainer,
    )
    this.whatsappButton = document.querySelector(this.elements.whatsappButton)
    this.isVisible = false

    if (
      !this.formContainer ||
      !this.purchaseContainer ||
      !this.whatsappButton
    ) {
      console.error('Required elements not found')
      return
    }

    this.initializeStyles()
    this.initializeFirstRender()
    this.setupObserver()
    this.setupClickHandler()
  }

  private initializeStyles(): void {
    if (this.purchaseContainer) {
      Object.assign(this.purchaseContainer.style, {
        position: 'fixed',
        bottom: '-100%',
        left: '0',
        width: '100%',
        transition: 'all 0.3s ease-in-out',
        zIndex: '1000',
        opacity: '0',
      })
    }

    if (this.whatsappButton) {
      Object.assign(this.whatsappButton.style, {
        position: 'fixed',
        transition: 'all 0.3s ease-in-out',
        ...this.options.whatsappPositions.default,
      })
    }
  }

  private initializeFirstRender(): void {
    requestAnimationFrame(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio <= this.options.threshold.end) {
            setTimeout(() => this.showElements(), 50)
          }
        },
        { threshold: [0, this.options.threshold.end] },
      )

      if (this.formContainer) {
        observer.observe(this.formContainer)
        setTimeout(() => observer.disconnect(), 100)
      }
    })
  }

  private setupClickHandler(): void {
    if (!this.purchaseContainer || !this.formContainer) return

    const button = this.purchaseContainer.querySelector('button')
    if (button) {
      button.addEventListener('click', e => {
        e.preventDefault()
        this.scrollToForm()
      })
    } else {
      this.purchaseContainer.addEventListener('click', () => {
        this.scrollToForm()
      })
    }
  }

  private scrollToForm(): void {
    if (!this.formContainer) return

    this.formContainer.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  }

  private setupObserver(): void {
    const thresholdSteps = Array.from({ length: 100 }, (_, i) => i / 100)

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const ratio = entry.intersectionRatio

          if (ratio >= this.options.threshold.start) {
            this.hideElements()
          } else if (ratio <= this.options.threshold.end) {
            this.showElements()
          }
        })
      },
      {
        threshold: thresholdSteps,
        rootMargin: '0px',
      },
    )

    if (this.formContainer) {
      observer.observe(this.formContainer)
    }
  }

  private showElements(): void {
    if (this.purchaseContainer && !this.isVisible) {
      this.isVisible = true
      Object.assign(
        this.purchaseContainer.style,
        this.options.animationOptions.active,
      )

      if (this.whatsappButton) {
        Object.assign(
          this.whatsappButton.style,
          this.options.whatsappPositions.shifted,
        )
      }
    }
  }

  private hideElements(): void {
    if (this.purchaseContainer && this.isVisible) {
      this.isVisible = false
      Object.assign(
        this.purchaseContainer.style,
        this.options.animationOptions.exit,
      )

      if (this.whatsappButton) {
        Object.assign(
          this.whatsappButton.style,
          this.options.whatsappPositions.default,
        )
      }
    }
  }
}

export { FloatingButtonsManager }
