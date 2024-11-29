interface NavConfig {
  navId: string
  contentId: string
  mobileOnly?: boolean // Mobil ekranda çalışması için breakpoint kontrolü
  mobileBreakpoint?: number // Mobil breakpoint değeri (varsayılan: 768px)
  animationDuration?: number // Animasyon süresi (ms)
  throttleDelay?: number // Scroll event throttle delay (ms)
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
    transition?: string
  }
}

class NavStickyManager {
  private nav: HTMLElement | null
  private content: HTMLElement | null
  private isFixed: boolean = false
  private placeholder: HTMLElement | null = null
  private navInitialTop: number = 0
  private contentTop: number = 0
  private contentBottom: number = 0
  private isTransitioning: boolean = false
  private scrollTimeout: number | null = null
  private resizeObserver: ResizeObserver | null = null
  private initialNavStyles: {
    maxWidth?: string
    margin?: string
    padding?: string
    transition?: string
  } = {}

  constructor(private config: NavConfig) {
    // Varsayılan değerleri ayarla
    this.config = {
      ...config,
      mobileOnly: config.mobileOnly ?? true,
      mobileBreakpoint: config.mobileBreakpoint ?? 768,
      animationDuration: config.animationDuration ?? 300,
      throttleDelay: config.throttleDelay ?? 100,
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

    // İlk stilleri ve pozisyonları kaydet
    this.saveInitialStyles()
    this.saveInitialPositions()

    // Event listener'ları ekle
    this.setupEventListeners()

    // ResizeObserver ekle
    this.setupResizeObserver()

    // İlk durumu kontrol et
    this.checkPosition()
  }

  private setupEventListeners(): void {
    // Scroll event için throttle uygula
    let lastScrollTime = 0

    window.addEventListener(
      'scroll',
      () => {
        const now = Date.now()

        if (now - lastScrollTime >= this.config.throttleDelay!) {
          this.checkPosition()
          lastScrollTime = now
        }
      },
      { passive: true },
    )

    // Sayfa yüklendiğinde ve resize olduğunda pozisyonları güncelle
    window.addEventListener('load', () => this.recalculate())
    window.addEventListener(
      'resize',
      this.throttle(() => {
        this.recalculate()
      }, 250),
    )
  }

  private setupResizeObserver(): void {
    // İçerik boyutu değiştiğinde pozisyonları güncelle
    this.resizeObserver = new ResizeObserver(
      this.throttle(() => {
        this.recalculate()
      }, 250),
    )

    if (this.content) {
      this.resizeObserver.observe(this.content)
    }
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

    // Nav görünür durumda mı kontrol et
    const isNavVisible = scrollY >= this.navInitialTop

    // Content viewport içinde mi kontrol et
    const isContentVisible =
      this.contentTop <= scrollY + viewportHeight &&
      scrollY <= this.contentBottom

    // Nav'ın container içinde kalması kontrolü
    const isWithinContainer = scrollY + navHeight <= this.contentBottom

    return isNavVisible && isContentVisible && isWithinContainer
  }

  private checkPosition(): void {
    if (this.isTransitioning || !this.nav) return

    const shouldBeFixed = this.shouldActivate()

    if (shouldBeFixed && !this.isFixed) {
      this.makeNavFixed()
    } else if (!shouldBeFixed && this.isFixed) {
      this.makeNavNormal()
    }
  }

  private makeNavFixed(): void {
    if (!this.nav || this.isFixed) return

    // Animasyon için transition ekle
    this.nav.style.transition = `all ${this.config.animationDuration}ms ease`

    // Placeholder oluştur
    this.placeholder = document.createElement('div')
    this.placeholder.style.height = `${this.nav.offsetHeight}px`
    this.placeholder.style.transition = `height ${this.config.animationDuration}ms ease`
    this.nav.parentNode?.insertBefore(this.placeholder, this.nav)

    // Container için wrapper oluştur
    const wrapper = document.createElement('div')
    wrapper.style.maxWidth =
      this.config.fixedStyles.maxWidth || this.initialNavStyles.maxWidth || ''
    wrapper.style.margin =
      this.config.fixedStyles.margin || this.initialNavStyles.margin || ''
    wrapper.style.padding =
      this.config.fixedStyles.padding || this.initialNavStyles.padding || ''
    wrapper.id = 'nav-fixed-wrapper'

    // Nav'ı wrapper'a taşı
    this.nav.parentNode?.insertBefore(wrapper, this.nav)
    wrapper.appendChild(this.nav)

    // Fixed stilleri uygula
    requestAnimationFrame(() => {
      if (!this.nav) return
      Object.assign(this.nav.style, this.config.fixedStyles)

      // Animasyon bitince flag'i güncelle
      this.isTransitioning = true
      setTimeout(() => {
        this.isTransitioning = false
      }, this.config.animationDuration)
    })

    this.isFixed = true
  }

  private makeNavNormal(): void {
    if (!this.nav || !this.isFixed) return

    // Animasyon için transition ekle
    this.nav.style.transition = `all ${this.config.animationDuration}ms ease`

    // Wrapper'ı kaldır ve nav'ı orijinal yerine taşı
    const wrapper = document.getElementById('nav-fixed-wrapper')
    if (wrapper && wrapper.parentNode) {
      wrapper.parentNode.insertBefore(this.nav, wrapper)
      wrapper.remove()
    }

    // Stilleri temizle
    requestAnimationFrame(() => {
      if (!this.nav) return

      this.nav.style.position = ''
      this.nav.style.top = ''
      this.nav.style.left = ''
      this.nav.style.width = ''
      this.nav.style.zIndex = ''
      this.nav.style.backgroundColor = ''
      this.nav.style.borderBottom = ''
      this.nav.style.boxShadow = ''
      this.nav.style.maxWidth = this.initialNavStyles.maxWidth || ''
      this.nav.style.margin = this.initialNavStyles.margin || ''
      this.nav.style.padding = this.initialNavStyles.padding || ''

      // Animasyon bitince transition'ı kaldır
      this.isTransitioning = true
      setTimeout(() => {
        if (this.nav) {
          this.nav.style.transition = this.initialNavStyles.transition || ''
        }
        this.isTransitioning = false
      }, this.config.animationDuration)
    })

    // Placeholder'ı kaldır
    if (this.placeholder) {
      this.placeholder.style.height = '0'
      setTimeout(() => {
        this.placeholder?.remove()
        this.placeholder = null
      }, this.config.animationDuration)
    }

    this.isFixed = false
  }

  public recalculate(): void {
    this.saveInitialPositions()
    this.checkPosition()
  }

  public destroy(): void {
    // Event listener'ları ve observer'ı temizle
    window.removeEventListener('resize', this.recalculate)
    this.resizeObserver?.disconnect()

    // Normal duruma döndür
    this.makeNavNormal()
  }
}

export { NavStickyManager, type NavConfig }
