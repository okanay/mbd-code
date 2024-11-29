interface NavConfig {
  navId: string
  contentId: string
  mobileOnly?: boolean
  mobileBreakpoint?: number
  animationDuration?: number
  throttleDelay?: number
  threshold?: number // Animasyon tetiklenme eşiği
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
  private nav: HTMLElement | null
  private content: HTMLElement | null
  private isFixed: boolean = false
  private isAnimating: boolean = false
  private placeholder: HTMLElement | null = null
  private navInitialTop: number = 0
  private contentTop: number = 0
  private contentBottom: number = 0
  private lastScrollY: number = 0
  private scrollDirection: 'up' | 'down' = 'up'
  private resizeObserver: ResizeObserver | null = null
  private initialNavStyles: {
    maxWidth?: string
    margin?: string
    padding?: string
    transform?: string
    transition?: string
  } = {}

  constructor(private config: NavConfig) {
    this.config = {
      ...config,
      mobileOnly: config.mobileOnly ?? true,
      mobileBreakpoint: config.mobileBreakpoint ?? 1080,
      animationDuration: config.animationDuration ?? 300,
      throttleDelay: config.throttleDelay ?? 100,
      threshold: config.threshold ?? 50, // 50px varsayılan eşik değeri
    }

    this.init()
  }

  private init(): void {
    this.nav = document.querySelector(this.config.navId)
    this.content = document.querySelector(this.config.contentId)

    if (!this.nav || !this.content) {
      console.error('Required elements not found')
      return
    }

    // İlk durumu ayarla
    this.setupInitialState()
    this.setupEventListeners()
    this.checkPosition(true) // true = initial check
  }

  private setupInitialState(): void {
    if (!this.nav) return

    // İlk stiller ve pozisyonları kaydet
    this.saveInitialStyles()
    this.saveInitialPositions()

    // Başlangıç animasyon stillerini ayarla
    this.nav.style.transition = `all ${this.config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`
    this.nav.style.willChange = 'transform' // Performance optimizasyonu
  }

  private setupEventListeners(): void {
    let scrollTimeout: number | undefined

    // Scroll yönünü ve hızını takip eden gelişmiş scroll listener
    window.addEventListener(
      'scroll',
      () => {
        if (this.isAnimating) return

        window.cancelAnimationFrame(scrollTimeout)
        scrollTimeout = window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY
          this.scrollDirection =
            currentScrollY > this.lastScrollY ? 'down' : 'up'

          // Scroll hızını ve yönünü hesapla
          const scrollSpeed = Math.abs(currentScrollY - this.lastScrollY)
          const shouldUpdate = scrollSpeed < 50 // Çok hızlı scroll'da güncelleme yapma

          if (shouldUpdate) {
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

    // Sayfa yüklendiğinde pozisyonları güncelle
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

  private saveInitialStyles(): void {
    if (!this.nav) return

    const computedStyle = window.getComputedStyle(this.nav)
    this.initialNavStyles = {
      maxWidth: computedStyle.maxWidth,
      margin: computedStyle.margin,
      padding: computedStyle.padding,
      transform: computedStyle.transform,
      transition: computedStyle.transition,
    }
  }

  private saveInitialPositions(): void {
    if (!this.nav || !this.content) return

    const navRect = this.nav.getBoundingClientRect()
    const contentRect = this.content.getBoundingClientRect()

    this.navInitialTop = navRect.top + window.scrollY
    this.contentTop = contentRect.top + window.scrollY
    this.contentBottom = contentRect.bottom + window.scrollY
  }

  private shouldActivate(): boolean {
    if (this.isAnimating) return this.isFixed

    // Mobil kontrolü
    if (
      this.config.mobileOnly &&
      window.innerWidth > this.config.mobileBreakpoint!
    ) {
      return false
    }

    const scrollY = window.scrollY
    const viewportHeight = window.innerHeight
    const navHeight = this.nav?.offsetHeight || 0

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

  private checkPosition(isInitial: boolean = false): void {
    if (!this.nav || (this.isAnimating && !isInitial)) return

    const shouldBeFixed = this.shouldActivate()

    if (shouldBeFixed && !this.isFixed) {
      this.makeNavFixed()
    } else if (!shouldBeFixed && this.isFixed) {
      this.makeNavNormal()
    }
  }

  private async makeNavFixed(): Promise<void> {
    if (!this.nav || this.isFixed || this.isAnimating) return

    this.isAnimating = true

    // Önce transform ile yukarı çık
    this.nav.style.transform = 'translateY(-100%)'

    // Placeholder oluştur
    this.placeholder = document.createElement('div')
    this.placeholder.style.height = `${this.nav.offsetHeight}px`
    this.nav.parentNode?.insertBefore(this.placeholder, this.nav)

    // Fixed stilleri uygula
    Object.assign(this.nav.style, this.config.fixedStyles)

    // RAF ile smooth animasyon
    requestAnimationFrame(() => {
      if (!this.nav) return

      // Transform'u sıfırla = aşağı in
      this.nav.style.transform = 'translateY(0)'

      // Animasyon bitince
      setTimeout(() => {
        this.isAnimating = false
        this.isFixed = true
      }, this.config.animationDuration)
    })
  }

  private async makeNavNormal(): Promise<void> {
    if (!this.nav || !this.isFixed || this.isAnimating) return

    this.isAnimating = true

    // Önce yukarı çık
    this.nav.style.transform = 'translateY(-100%)'

    await new Promise(resolve =>
      setTimeout(resolve, this.config.animationDuration! / 2),
    )

    // Stilleri temizle
    Object.assign(this.nav.style, {
      position: '',
      top: '',
      left: '',
      width: '',
      zIndex: '',
      backgroundColor: '',
      borderBottom: '',
      boxShadow: '',
      maxWidth: this.initialNavStyles.maxWidth || '',
      margin: this.initialNavStyles.margin || '',
      padding: this.initialNavStyles.padding || '',
    })

    // Transform'u normale döndür
    this.nav.style.transform = 'translateY(0)'

    // Placeholder'ı kaldır
    if (this.placeholder) {
      this.placeholder.style.height = '0'
      setTimeout(() => {
        this.placeholder?.remove()
        this.placeholder = null
      }, this.config.animationDuration)
    }

    // Animasyon bitince
    setTimeout(() => {
      this.isAnimating = false
      this.isFixed = false
    }, this.config.animationDuration)
  }

  public recalculate(): void {
    this.saveInitialPositions()
    this.checkPosition(true)
  }

  public destroy(): void {
    this.resizeObserver?.disconnect()
    this.makeNavNormal()
  }
}

export { NavStickyManager, type NavConfig }
