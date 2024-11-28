interface CompleteProductButtonElements {
  formContainerId: string
  completePurchaseContainer: string
}

interface AnimationOptions {
  active: Partial<CSSStyleDeclaration>
  exit: Partial<CSSStyleDeclaration>
}

interface ThresholdOptions {
  start: number // Form'un yüzde kaçı görünür olduğunda button gizlensin (0-1 arası)
  end: number // Form'un yüzde kaçı görünmez olduğunda button görünsün (0-1 arası)
}

interface CompleteProductButtonOptions {
  threshold: ThresholdOptions
  animationOptions: AnimationOptions
}

class CompleteProductButton {
  private elements: CompleteProductButtonElements
  private options: CompleteProductButtonOptions
  private formContainer: HTMLElement | null
  private purchaseContainer: HTMLElement | null
  private isVisible: boolean

  constructor(config: {
    elements: CompleteProductButtonElements
    options: CompleteProductButtonOptions
  }) {
    this.elements = config.elements
    this.options = config.options
    this.formContainer = document.querySelector(this.elements.formContainerId)
    this.purchaseContainer = document.querySelector(
      this.elements.completePurchaseContainer,
    )
    this.isVisible = false

    if (!this.formContainer || !this.purchaseContainer) {
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
  }

  private initializeFirstRender(): void {
    requestAnimationFrame(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.intersectionRatio <= this.options.threshold.end) {
            setTimeout(() => this.showPurchaseContainer(), 50)
          }
        },
        { threshold: [0, this.options.threshold.end] },
      )

      if (this.formContainer) {
        observer.observe(this.formContainer)
        // Bir kez çalıştıktan sonra observer'ı kaldır
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
    // Çoklu threshold değerleri oluştur
    const thresholdSteps = Array.from({ length: 100 }, (_, i) => i / 100)

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const ratio = entry.intersectionRatio

          // Form'un görünürlük oranına göre button'u göster/gizle
          if (ratio >= this.options.threshold.start) {
            this.hidePurchaseContainer()
          } else if (ratio <= this.options.threshold.end) {
            this.showPurchaseContainer()
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

  private showPurchaseContainer(): void {
    if (this.purchaseContainer && !this.isVisible) {
      this.isVisible = true
      Object.assign(
        this.purchaseContainer.style,
        this.options.animationOptions.active,
      )
    }
  }

  private hidePurchaseContainer(): void {
    if (this.purchaseContainer && this.isVisible) {
      this.isVisible = false
      Object.assign(
        this.purchaseContainer.style,
        this.options.animationOptions.exit,
      )
    }
  }
}

export { CompleteProductButton }
