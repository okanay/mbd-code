interface NavConfig {
  navId: string
  contentId: string
  mobileOnly?: boolean
  mobileBreakpoint?: number
  animationDuration?: number
  throttleDelay?: number
  threshold?: number
  fixedStyles: {
    position: 'fixed'
    top: string
    left: string
    width: string
    zIndex: string
    backgroundColor: string
    borderBottom?: string
    boxShadow?: string
    maxWidth?: string
    margin?: string
    padding?: string
    transform?: string
    transition?: string
  }
}

class NavStickyManager {
  private originalNav: HTMLElement | null = null
  private clonedNav: HTMLElement | null = null
  private content: HTMLElement | null = null
  private isVisible: boolean = false
  private lastScrollY: number = 0
  private navInitialTop: number = 0
  private contentTop: number = 0
  private contentBottom: number = 0
  private resizeObserver: ResizeObserver | null = null

  constructor(private config: NavConfig) {
    this.config = {
      ...config,
      mobileOnly: config.mobileOnly ?? true,
      mobileBreakpoint: config.mobileBreakpoint ?? 1080,
      animationDuration: config.animationDuration ?? 300,
      throttleDelay: config.throttleDelay ?? 100,
      threshold: config.threshold ?? 50,
    }

    this.init()
  }

  private init(): void {
    this.originalNav = document.querySelector(this.config.navId)
    this.content = document.querySelector(this.config.contentId)

    if (!this.originalNav || !this.content) {
      console.error('Required elements not found')
      return
    }

    this.createClone()
    this.setupInitialState()
    this.setupEventListeners()
    this.checkPosition()
  }

  private createClone(): void {
    if (!this.originalNav) return

    // Derin klon oluştur
    this.clonedNav = this.originalNav.cloneNode(true) as HTMLElement

    // Klonu özelleştir
    this.clonedNav.id = `${this.originalNav.id}-clone`
    this.clonedNav.setAttribute('aria-hidden', 'true')

    // Fixed stilleri uygula
    Object.assign(this.clonedNav.style, {
      ...this.config.fixedStyles,
      position: 'fixed',
      transform: 'translateY(-120%)', // Başlangıçta gizli
      transition: `transform ${this.config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`,
      willChange: 'transform',
    })

    // Event listener'ları klona da ekle
    this.syncEventListeners(this.originalNav, this.clonedNav)

    // Klonu body'nin en altına ekle
    document.body.appendChild(this.clonedNav)
  }

  private syncEventListeners(source: HTMLElement, target: HTMLElement): void {
    // Tüm tıklanabilir elementleri bul
    const sourceButtons = source.querySelectorAll('button, a')
    const targetButtons = target.querySelectorAll('button, a')

    // Her bir butona event listener ekle
    sourceButtons.forEach((btn, index) => {
      const targetBtn = targetButtons[index]
      if (!targetBtn) return

      // Orijinal butonun tüm event listener'larını klona kopyala
      const cloneClick = (e: Event) => {
        e.preventDefault()
        ;(btn as HTMLElement).click() // Orijinal butonu tetikle

        // Data state'i senkronize et
        const state = btn.getAttribute('data-state')
        targetBtn.setAttribute('data-state', state || '')
      }

      targetBtn.addEventListener('click', cloneClick)
    })
  }

  private setupInitialState(): void {
    if (!this.originalNav) return
    this.saveInitialPositions()
  }

  private setupEventListeners(): void {
    let scrollTimeout: number | undefined

    window.addEventListener(
      'scroll',
      () => {
        if (scrollTimeout !== undefined) {
          window.cancelAnimationFrame(scrollTimeout)
        }
        scrollTimeout = window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          if (Math.abs(currentScrollY - this.lastScrollY) < 50) {
            this.checkPosition()
          }
          this.lastScrollY = currentScrollY
        })
      },
      { passive: true },
    )

    // Resize observer
    this.resizeObserver = new ResizeObserver(
      this.throttle(() => {
        this.recalculate()
      }, 250),
    )

    if (this.content) {
      this.resizeObserver.observe(this.content)
    }

    window.addEventListener('load', () => this.recalculate())
  }

  private throttle(func: Function, limit: number): () => void {
    let inThrottle: boolean
    return () => {
      if (!inThrottle) {
        func()
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  private saveInitialPositions(): void {
    if (!this.originalNav || !this.content) return

    const navRect = this.originalNav.getBoundingClientRect()
    const contentRect = this.content.getBoundingClientRect()

    this.navInitialTop = navRect.top + window.scrollY
    this.contentTop = contentRect.top + window.scrollY
    this.contentBottom = contentRect.bottom + window.scrollY
  }

  private shouldActivate(): boolean {
    // Mobil kontrolü
    if (
      this.config.mobileOnly &&
      window.innerWidth > this.config.mobileBreakpoint!
    ) {
      return false
    }

    const scrollY = window.scrollY
    const viewportHeight = window.innerHeight
    const navHeight = this.originalNav?.offsetHeight || 0

    // Threshold kontrolü
    const passedThreshold =
      scrollY > this.navInitialTop + this.config.threshold!

    // Content viewport içinde mi kontrol et
    const isContentVisible =
      this.contentTop <= scrollY + viewportHeight &&
      scrollY <= this.contentBottom

    // Nav'ın container içinde kalması kontrolü
    const isWithinContainer = scrollY + navHeight <= this.contentBottom

    return passedThreshold && isContentVisible && isWithinContainer
  }

  private checkPosition(): void {
    if (!this.clonedNav) return

    const shouldBeVisible = this.shouldActivate()

    if (shouldBeVisible && !this.isVisible) {
      this.showClone()
    } else if (!shouldBeVisible && this.isVisible) {
      this.hideClone()
    }
  }

  private showClone(): void {
    if (!this.clonedNav) return

    requestAnimationFrame(() => {
      if (!this.clonedNav) return
      this.clonedNav.style.transform = 'translateY(0)'
      this.isVisible = true
    })
  }

  private hideClone(): void {
    if (!this.clonedNav) return

    requestAnimationFrame(() => {
      if (!this.clonedNav) return
      this.clonedNav.style.transform = 'translateY(-120%)'
      this.isVisible = false
    })
  }

  public recalculate(): void {
    this.saveInitialPositions()
    this.checkPosition()

    // Klon varsa boyutları güncelle
    if (this.clonedNav && this.originalNav) {
      const rect = this.originalNav.getBoundingClientRect()
      Object.assign(this.clonedNav.style, {
        width: `${rect.width}px`,
        height: `${rect.height}px`,
      })
    }
  }

  public destroy(): void {
    // Event listener'ları temizle
    this.resizeObserver?.disconnect()

    // Klonu kaldır
    this.clonedNav?.remove()
    this.clonedNav = null
  }
}

export { NavStickyManager, type NavConfig }
