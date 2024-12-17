interface SliderAnimationConfig {
  duration?: number
  timingFunction?: string
  transforms?: {
    fromLeft?: {
      enter: string
      exit: string
    }
    fromRight?: {
      enter: string
      exit: string
    }
  }
  opacitySelected?: number
  opacityNotSelected?: number
  scaleSelected?: number
  scaleNotSelected?: number
}

interface ResponsiveConfig {
  enabled: boolean
  minWidth: number
  maxWidth: number
}

interface SliderConfig {
  container: string | HTMLElement
  slideSelector: string
  buttonSelector: string
  animationConfig?: SliderAnimationConfig
  nextButtonSelector?: string
  prevButtonSelector?: string
  defaultActiveIndex?: number
  activeButtonClass?: string
  activeButtonClassTarget?: string
  auto?: boolean
  autoInterval?: number
  responsive?: ResponsiveConfig
  onIndexChange?: (index?: number) => void
  lazyLoading?: {
    enabled: boolean
    dataSrcAttribute?: string
    loadedClass?: string
    lazyClass?: string
  }
  options: {
    zIndex: {
      clone: number
      selected: number
      notSelected: number
    }
  }
}

class Slider {
  private container: HTMLElement
  private slider: HTMLElement
  private slides: NodeListOf<HTMLElement>
  private buttons: NodeListOf<HTMLButtonElement>
  private nextButton: HTMLElement | null
  private prevButton: HTMLElement | null
  private activeIndex: number
  private isAnimating: boolean
  private activeButtonClass: string
  private activeButtonClassTarget: string
  private autoEnabled: boolean
  private autoInterval: number
  private autoTimer: NodeJS.Timeout | null
  private onIndexChange?: (index?: number) => void
  private lastDirection: 'left' | 'right' = 'right'
  private lazyLoadConfig: {
    enabled: boolean
    dataSrcAttribute: string
    loadedClass: string
    lazyClass: string
  }
  private intersectionObserver: IntersectionObserver | null = null
  private options: {
    zIndex: {
      clone: number
      selected: number
      notSelected: number
    }
  }
  private animationConfig: SliderAnimationConfig
  private responsiveConfig: ResponsiveConfig
  private resizeObserver: ResizeObserver | null
  private mutationObserver: MutationObserver | null = null

  private initialConfig: SliderConfig
  private queuedTransition: boolean = false
  private loadedImages: Set<string> = new Set()
  private loadedElements: WeakSet<HTMLElement> = new WeakSet()
  private isEnabled: boolean = false

  constructor(config: SliderConfig) {
    // Initialize container element
    this.container =
      typeof config.container === 'string'
        ? (document.querySelector(config.container) as HTMLElement)
        : config.container

    if (!this.container) {
      throw new Error('Container element not found')
    }

    // Initialize slider element
    this.slider = this.container.querySelector('ul') as HTMLElement
    if (!this.slider) {
      throw new Error('Slider element not found')
    }

    // Initialize slides and buttons
    this.slides = this.container.querySelectorAll(config.slideSelector)
    this.buttons = document.querySelectorAll(config.buttonSelector)

    // Initialize navigation buttons
    this.nextButton = config.nextButtonSelector
      ? document.querySelector(config.nextButtonSelector)
      : null
    this.prevButton = config.prevButtonSelector
      ? document.querySelector(config.prevButtonSelector)
      : null

    if (!this.slides.length || !this.buttons.length) {
      throw new Error('Slides or buttons not found')
    }

    // Store initial config
    this.initialConfig = { ...config }

    // Initialize animation config
    this.animationConfig = {
      duration: config.animationConfig?.duration || 500,
      timingFunction: config.animationConfig?.timingFunction || 'ease-in-out',
      transforms: {
        fromLeft: {
          enter:
            config.animationConfig?.transforms?.fromLeft?.enter ||
            'translate(-120%, 0%)',
          exit:
            config.animationConfig?.transforms?.fromLeft?.exit ||
            'translate(20%, 0%)',
        },
        fromRight: {
          enter:
            config.animationConfig?.transforms?.fromRight?.enter ||
            'translate(120%, 0%)',
          exit:
            config.animationConfig?.transforms?.fromRight?.exit ||
            'translate(-20%, 0%)',
        },
      },
      opacitySelected: config.animationConfig?.opacitySelected ?? 1,
      opacityNotSelected: config.animationConfig?.opacityNotSelected ?? 0.85,
      scaleSelected: config.animationConfig?.scaleSelected ?? 1,
      scaleNotSelected: config.animationConfig?.scaleNotSelected ?? 0.85,
    }

    // Initialize responsive config
    this.responsiveConfig = {
      enabled: config.responsive?.enabled ?? false,
      minWidth: config.responsive?.minWidth ?? 0,
      maxWidth: config.responsive?.maxWidth ?? 9999,
    }

    // Initialize slider state
    this.activeIndex = config.defaultActiveIndex || 0
    this.isAnimating = false
    this.activeButtonClass = config.activeButtonClass || 'slider-active-btn'
    this.activeButtonClassTarget =
      config.activeButtonClassTarget || config.buttonSelector
    this.autoEnabled = config.auto || false
    this.autoInterval = config.autoInterval || 5000
    this.autoTimer = null

    // Initialize z-index options
    this.options = config.options || {
      zIndex: {
        clone: 60,
        selected: 50,
        notSelected: -10,
      },
    }

    // Initialize lazy loading config
    this.lazyLoadConfig = {
      enabled: config.lazyLoading?.enabled ?? true,
      dataSrcAttribute: config.lazyLoading?.dataSrcAttribute ?? 'data-src',
      loadedClass: config.lazyLoading?.loadedClass ?? 'loaded',
      lazyClass: config.lazyLoading?.lazyClass ?? 'lazy-slider',
    }

    // Initialize loading tracking
    this.loadedImages = new Set()

    // Check slider status from data attribute
    const status = this.slider.getAttribute('data-status')
    // Eğer data-status yoksa veya geçersiz bir değerse 'enable' olarak varsay
    this.isEnabled = status ? status === 'enable' : true

    // Initialize change handler and observer
    this.onIndexChange = config.onIndexChange
    this.resizeObserver = null
    this.intersectionObserver = null

    // Apply initial styles and initialize slider
    this.applyInitialStyles()
    this.init()
    this.setupMutationObserver()
  }

  private init(): void {
    if (this.slides.length > 0 && this.isEnabled) {
      // Sadece slider enable ise lazy loading'i başlat
      if (this.lazyLoadConfig.enabled) {
        if (this.isSliderEnabled()) {
          this.loadSlideImages(this.activeIndex)
        } else {
          this.setupGridLazyLoading()
        }
      }
    }

    this.updateActiveButton(this.activeIndex)

    this.buttons.forEach((button: HTMLButtonElement) => {
      button.addEventListener('click', () => {
        if (!this.isSliderEnabled()) return
        const target = button.getAttribute('data-target')
        const targetIndex = parseInt(target as string, 10)
        const direction = targetIndex > this.activeIndex ? 'right' : 'left'
        this.goToSlide(targetIndex, direction)
      })
    })

    // Next ve Prev butonlarını dinle
    if (this.nextButton) {
      this.nextButton.addEventListener('click', () => {
        if (!this.isSliderEnabled()) return
        this.next()
      })
    }

    if (this.prevButton) {
      this.prevButton.addEventListener('click', () => {
        if (!this.isSliderEnabled()) return
        this.prev()
      })
    }

    if (this.autoEnabled) {
      this.container.addEventListener('mouseenter', () => this.pauseAutoPlay())
      this.container.addEventListener('mouseleave', () => this.resumeAutoPlay())
      this.startAutoPlay()
    }

    this.initResizeObserver()
  }

  private isImageLazy(img: HTMLElement): boolean {
    // Slider disabled ise hiç yükleme yapma
    if (!this.isEnabled) {
      return false
    }

    // Eğer bu element daha önce yüklendiyse lazy loading yapma
    if (this.loadedElements.has(img)) return false

    // Lazy loading class kontrolü
    if (!img.classList.contains(this.lazyLoadConfig.lazyClass)) return false

    // data-src attribute kontrolü
    const dataSrc = img.getAttribute(this.lazyLoadConfig.dataSrcAttribute)
    if (!dataSrc) return false

    // Şu anki src ile data-src karşılaştırması
    if (dataSrc === img.getAttribute('src')) return false

    return true
  }

  private loadImage(img: HTMLElement): void {
    if (this.isImageLazy(img)) {
      const dataSrc = img.getAttribute(this.lazyLoadConfig.dataSrcAttribute)
      if (dataSrc) {
        img.setAttribute('src', dataSrc)
        img.classList.add(this.lazyLoadConfig.loadedClass)
        // Element'i yüklenmiş olarak işaretle
        this.loadedElements.add(img)
      }
    }
  }

  private loadSlideImages(currentIndex: number): void {
    // Aktif slide'ın görselini yükle
    if (!this.isEnabled) {
      return
    }

    const activeSlide = this.slides[currentIndex]
    const activeImg = activeSlide.querySelector('img')
    if (activeImg && this.isImageLazy(activeImg)) {
      this.loadImage(activeImg)
    }

    // Bir sonraki slide'ın görselini yükle
    const nextIndex = (currentIndex + 1) % this.slides.length
    const nextSlide = this.slides[nextIndex]
    const nextImg = nextSlide.querySelector('img')
    if (nextImg && this.isImageLazy(nextImg)) {
      this.loadImage(nextImg)
    }

    // Bir önceki slide'ın görselini yükle
    const prevIndex =
      (currentIndex - 1 + this.slides.length) % this.slides.length
    const prevSlide = this.slides[prevIndex]
    const prevImg = prevSlide.querySelector('img')
    if (prevImg && this.isImageLazy(prevImg)) {
      this.loadImage(prevImg)
    }
  }

  private setupGridLazyLoading(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
    }

    this.intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const slide = entry.target as HTMLElement
            const img = slide.querySelector('img')
            if (img && this.isImageLazy(img)) {
              this.loadImage(img)
            }
          }
        })
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1,
      },
    )

    // Sadece lazy-slider class'ı olan ve henüz yüklenmemiş görselleri observe et
    this.slides.forEach(slide => {
      const img = slide.querySelector('img')
      if (img && this.isImageLazy(img)) {
        this.intersectionObserver!.observe(slide)
      }
    })
  }

  private applyInitialStyles(): void {
    // Tüm slide'lara önce temel stiller uygula
    this.slides.forEach((slide: HTMLElement) => {
      slide.style.transition = 'none' // Başlangıçta transition'ı devre dışı bırak
      slide.style.opacity = `${this.animationConfig.opacityNotSelected}`
      slide.style.scale = `${this.animationConfig.scaleNotSelected}`
      slide.style.zIndex = this.options.zIndex.notSelected.toString()
    })

    // Aktif slide'ı ayarla
    if (this.slides[this.activeIndex]) {
      const activeSlide = this.slides[this.activeIndex]
      activeSlide.style.opacity = `${this.animationConfig.opacitySelected}`
      activeSlide.style.scale = `${this.animationConfig.scaleSelected}`
      activeSlide.style.zIndex = this.options.zIndex.selected.toString()
    }

    // RequestAnimationFrame ile transition'ı geri getir
    requestAnimationFrame(() => {
      this.slides.forEach((slide: HTMLElement) => {
        slide.style.transition = `${this.animationConfig.duration}ms ${this.animationConfig.timingFunction}`
      })
    })
  }

  private setupMutationObserver(): void {
    // data-status ve data-active değişikliklerini izle
    this.mutationObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
          const target = mutation.target as HTMLElement

          // data-status değişikliği
          if (mutation.attributeName === 'data-status') {
            const newStatus = target.getAttribute('data-status') as
              | 'enable'
              | 'disable'
            this.updateStatus(newStatus)
          }

          // data-active değişikliği
          if (mutation.attributeName === 'data-active') {
            const parentElement = target.closest('#desktop-gallery-controller')
            if (parentElement) {
              const allSliders =
                parentElement.querySelectorAll('[id^="slider-"]')
              allSliders.forEach(sliderElement => {
                const status = sliderElement.getAttribute('data-status')
                if (status === 'enable') {
                  // Aktif slider'ın görsellerini yükle
                  const sliderId = sliderElement.id
                  const sliderIndex = parseInt(sliderId.split('-')[1])
                  this.preloadImagesForSlider(sliderElement as HTMLElement)
                }
              })
            }
          }
        }
      })
    })

    // Slider elementini observe et
    if (this.slider) {
      this.mutationObserver.observe(this.slider, {
        attributes: true,
        attributeFilter: ['data-status'],
      })

      // Gallery controller'ı da observe et
      const galleryController = document.getElementById(
        'desktop-gallery-controller',
      )
      if (galleryController) {
        this.mutationObserver.observe(galleryController, {
          attributes: true,
          attributeFilter: ['data-active'],
        })
      }
    }
  }

  private initResizeObserver(): void {
    if (this.responsiveConfig.enabled) {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkResponsiveState()
      })
      this.resizeObserver.observe(document.body)
    }
  }

  private isSliderEnabled(): boolean {
    if (!this.responsiveConfig.enabled) return true

    const windowWidth = window.innerWidth
    return (
      windowWidth >= this.responsiveConfig.minWidth &&
      windowWidth <= this.responsiveConfig.maxWidth
    )
  }

  private checkResponsiveState(): void {
    const wasEnabled = this.isSliderEnabled()
    const isNowEnabled = this.isSliderEnabled()

    if (wasEnabled !== isNowEnabled) {
      if (isNowEnabled) {
        // Grid modundan slider moduna geçiş
        this.enableSlider()
        this.updateAnimationConfig(this.initialConfig.animationConfig || {})
        if (this.initialConfig.auto) {
          this.enableAutoPlay()
        }

        // Grid modundan çıkınca observer'ı temizle
        if (this.intersectionObserver) {
          this.intersectionObserver.disconnect()
          this.intersectionObserver = null
        }

        // Slider modunda aktif ve komşu slide'ları yükle
        if (this.lazyLoadConfig.enabled) {
          this.loadSlideImages(this.activeIndex)
        }
      } else {
        // Slider modundan grid moduna geçiş
        this.disableSlider()
        this.resetAllAnimations()

        // Grid moduna geçince IntersectionObserver başlat
        if (this.lazyLoadConfig.enabled) {
          this.setupGridLazyLoading()
        }
      }
    }

    // Diğer stil işlemleri...
    this.slides.forEach((slide: HTMLElement) => {
      slide.style.transition = 'none'
    })

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (isNowEnabled) {
          this.slides.forEach((slide: HTMLElement) => {
            slide.style.transition = `${this.animationConfig.duration}ms ${this.animationConfig.timingFunction}`
          })
        }
      })
    })
  }

  private resetAllAnimations(): void {
    // Tüm slide'ların animasyonlarını sıfırla
    this.slides.forEach((slide: HTMLElement) => {
      slide.style.transition = 'none'
      slide.style.transform = 'translate(0%, 0%)'
      slide.style.opacity = '1'
      slide.style.scale = '1'
    })

    // Clone elementleri bul ve kaldır
    const clones = this.slider.querySelectorAll('[data-clone="true"]')
    clones.forEach(clone => clone.remove())

    // Animasyon durumunu sıfırla
    this.isAnimating = false
    this.queuedTransition = false
  }

  private enableSlider(): void {
    this.container.style.pointerEvents = 'auto'
    if (this.autoEnabled) {
      this.startAutoPlay()
    }
  }

  private disableSlider(): void {
    this.container.style.pointerEvents = 'none'
    this.pauseAutoPlay()

    // Tüm slide'ları varsayılan konumlarına getir
    this.slides.forEach((slide: HTMLElement) => {
      slide.style.transition = 'none'
      slide.style.transform = 'translate(0%, 0%)'
      slide.style.opacity = '1'
      slide.style.scale = '1'
      slide.style.zIndex = '0'
    })
  }

  private createCloneElement(
    sourceElement: HTMLElement,
    direction: 'left' | 'right',
  ): HTMLElement {
    const clone = sourceElement.cloneNode(true) as HTMLElement
    clone.dataset.clone = 'true'

    const initialTransform =
      direction === 'left'
        ? this.animationConfig.transforms?.fromLeft?.enter
        : this.animationConfig.transforms?.fromRight?.enter

    clone.style.transform = initialTransform!
    clone.style.transition = 'none'
    clone.style.opacity = `${this.animationConfig.opacityNotSelected}`
    clone.style.scale = `${this.animationConfig.scaleNotSelected}`
    clone.style.zIndex = this.options.zIndex.clone.toString()
    return clone
  }

  private updateActiveButton(targetIndex: number): void {
    const targetElements = document.querySelectorAll(
      this.activeButtonClassTarget,
    )

    targetElements.forEach((element: Element) => {
      ;(element as HTMLElement).classList.remove(this.activeButtonClass)
    })

    const activeButton = targetElements[targetIndex] as HTMLElement
    if (activeButton) {
      activeButton.classList.add(this.activeButtonClass)
    }
  }

  private startAutoPlay(): void {
    if (this.autoEnabled && this.isSliderEnabled()) {
      this.autoTimer = setInterval(() => {
        if (!this.isAnimating) {
          this.next()
        } else {
          // Eğer animasyon devam ediyorsa, bir sonraki geçişi işaretle
          this.queuedTransition = true
        }
      }, this.autoInterval) as unknown as NodeJS.Timeout
    }
  }

  private pauseAutoPlay(): void {
    if (this.autoTimer) {
      clearInterval(this.autoTimer)
      this.autoTimer = null
    }
  }

  private resumeAutoPlay(): void {
    this.pauseAutoPlay()
    this.startAutoPlay()
  }

  private resetAutoPlayTimer(): void {
    if (this.autoEnabled) {
      this.pauseAutoPlay()
      this.startAutoPlay()
    }
  }

  private async animateSlide(
    currentSlide: HTMLElement,
    clone: HTMLElement,
    direction: 'left' | 'right',
  ): Promise<void> {
    const exitTransform =
      direction === 'left'
        ? this.animationConfig.transforms?.fromLeft?.exit
        : this.animationConfig.transforms?.fromRight?.exit

    return new Promise(resolve => {
      requestAnimationFrame(() => {
        clone.style.transition = `${this.animationConfig.duration}ms ${this.animationConfig.timingFunction}`
        clone.style.transform = 'translate(0%, 0%)'
        clone.style.opacity = `${this.animationConfig.opacitySelected}`
        clone.style.scale = `${this.animationConfig.scaleSelected}`

        currentSlide.style.transition = `${this.animationConfig.duration}ms ${this.animationConfig.timingFunction}`
        currentSlide.style.transform = exitTransform!
        currentSlide.style.opacity = `${this.animationConfig.opacityNotSelected}`
        currentSlide.style.scale = `${this.animationConfig.scaleNotSelected}`

        setTimeout(() => {
          resolve()
          // Animasyon bittikten sonra bekleyen geçiş varsa uygula
          if (this.queuedTransition) {
            this.queuedTransition = false
            this.next()
          }
        }, this.animationConfig.duration)
      })
    })
  }

  public async goToSlide(
    targetIndex: number,
    direction?: 'left' | 'right',
  ): Promise<void> {
    if (
      !this.isEnabled ||
      !this.isSliderEnabled() ||
      this.isAnimating ||
      targetIndex === this.activeIndex
    ) {
      return
    }

    this.onIndexChange && this.onIndexChange(targetIndex)

    const slideDirection =
      direction ||
      (targetIndex > this.activeIndex
        ? 'right'
        : targetIndex < this.activeIndex
          ? 'left'
          : this.lastDirection)
    this.lastDirection = slideDirection

    this.resetAutoPlayTimer()
    this.isAnimating = true

    const currentSlide = this.slides[this.activeIndex]
    const targetSlide = this.slides[targetIndex]

    this.updateActiveButton(targetIndex)

    const clone = this.createCloneElement(targetSlide, slideDirection)
    this.slider.appendChild(clone)

    await this.animateSlide(currentSlide, clone, slideDirection)

    this.slides.forEach((slide: HTMLElement) => {
      slide.style.zIndex = this.options.zIndex.notSelected.toString()
      slide.style.transform = 'translate(0%, 0%)'
      slide.style.transition = 'none'
      slide.style.opacity = `${this.animationConfig.opacityNotSelected}`
      slide.style.scale = `${this.animationConfig.scaleNotSelected}`
    })

    targetSlide.style.zIndex = this.options.zIndex.selected.toString()
    targetSlide.style.opacity = `${this.animationConfig.opacitySelected}`
    targetSlide.style.scale = `${this.animationConfig.scaleSelected}`
    clone.remove()

    this.activeIndex = targetIndex
    this.isAnimating = false

    // Yeni slide'lar için görselleri yükle
    if (this.lazyLoadConfig.enabled) {
      this.loadSlideImages(this.activeIndex)
    }
  }

  public updateAnimationConfig(config: SliderAnimationConfig): void {
    this.animationConfig = {
      ...this.animationConfig,
      ...config,
      transforms: {
        ...this.animationConfig.transforms,
        fromLeft: {
          enter:
            config.transforms?.fromLeft?.enter ??
            this.animationConfig.transforms?.fromLeft?.enter!,
          exit:
            config.transforms?.fromLeft?.exit ??
            this.animationConfig.transforms?.fromLeft?.exit!,
        },
        fromRight: {
          enter:
            config.transforms?.fromRight?.enter ??
            this.animationConfig.transforms?.fromRight?.enter!,
          exit:
            config.transforms?.fromRight?.exit ??
            this.animationConfig.transforms?.fromRight?.exit!,
        },
      },
    }

    // initialConfig'i de güncelle
    this.initialConfig.animationConfig = { ...this.animationConfig }
  }

  public updateResponsiveConfig(config: ResponsiveConfig): void {
    // Mevcut config'i sakla
    const previousConfig = { ...this.responsiveConfig }

    this.responsiveConfig = {
      ...this.responsiveConfig,
      ...config,
    }

    // initialConfig'i de güncelle
    this.initialConfig.responsive = { ...this.responsiveConfig }

    if (config.enabled && !this.resizeObserver) {
      this.initResizeObserver()
    } else if (!config.enabled && this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
      this.enableSlider()
    }

    // Config değişikliğinden sonra durumu kontrol et
    if (this.responsiveConfig.enabled) {
      this.checkResponsiveState()
    }
  }

  public getCurrentIndex(): number {
    return this.activeIndex
  }

  public getSlidesCount(): number {
    return this.slides.length
  }

  public next(): void {
    if (!this.isSliderEnabled()) return
    const nextIndex = (this.activeIndex + 1) % this.slides.length
    this.goToSlide(nextIndex, 'right')
  }

  public prev(): void {
    if (!this.isSliderEnabled()) return
    const prevIndex =
      (this.activeIndex - 1 + this.slides.length) % this.slides.length
    this.goToSlide(prevIndex, 'left')
  }

  private preloadImagesForSlider(sliderElement: HTMLElement): void {
    const images = sliderElement.querySelectorAll(
      'img.lazy-slider',
    ) as NodeListOf<HTMLImageElement>
    images.forEach(img => {
      if (this.isImageLazy(img)) {
        const dataSrc = img.getAttribute(this.lazyLoadConfig.dataSrcAttribute)
        if (dataSrc && !this.loadedImages.has(dataSrc)) {
          this.loadImage(img)
          this.loadedImages.add(dataSrc)
        }
      }
    })
  }

  public updateStatus(status: 'enable' | 'disable'): void {
    const oldStatus = this.isEnabled
    this.isEnabled = status === 'enable'

    if (!oldStatus && this.isEnabled) {
      // Slider'ı enable durumuna getirdiğimizde
      if (this.activeIndex !== 0) {
        this.activeIndex = 0
        this.updateActiveButton(0)

        // Tüm slide'ların stillerini sıfırla
        this.slides.forEach((slide: HTMLElement) => {
          slide.style.zIndex = this.options.zIndex.notSelected.toString()
          slide.style.transform = 'translate(0%, 0%)'
          slide.style.transition = 'none'
          slide.style.opacity = `${this.animationConfig.opacityNotSelected}`
          slide.style.scale = `${this.animationConfig.scaleNotSelected}`
        })

        // Aktif slide'ı ayarla
        const activeSlide = this.slides[0]
        activeSlide.style.zIndex = this.options.zIndex.selected.toString()
        activeSlide.style.opacity = `${this.animationConfig.opacitySelected}`
        activeSlide.style.scale = `${this.animationConfig.scaleSelected}`

        // Varolan cloneları temizle
        const clones = this.slider.querySelectorAll('[data-clone="true"]')
        clones.forEach(clone => clone.remove())
      }

      // Lazy loading kontrolü ve görsel yükleme
      if (this.lazyLoadConfig.enabled) {
        if (this.isSliderEnabled()) {
          this.preloadImagesForSlider(this.slider)
        } else {
          this.setupGridLazyLoading()
        }
      }

      if (this.autoEnabled) {
        this.resetAutoPlayTimer()
      }
    }

    if (oldStatus && !this.isEnabled && this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }
  }

  public enableAutoPlay(): void {
    this.autoEnabled = true
    this.startAutoPlay()
  }

  public disableAutoPlay(): void {
    this.autoEnabled = false
    this.pauseAutoPlay()
  }

  public destroy(): void {
    this.pauseAutoPlay()

    if (this.resizeObserver) {
      this.resizeObserver.disconnect()
      this.resizeObserver = null
    }

    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect()
      this.intersectionObserver = null
    }

    if (this.nextButton) {
      this.nextButton.removeEventListener('click', () => this.next())
    }
    if (this.prevButton) {
      this.prevButton.removeEventListener('click', () => this.prev())
    }

    this.container.removeEventListener('mouseenter', () => this.pauseAutoPlay())
    this.container.removeEventListener('mouseleave', () =>
      this.resumeAutoPlay(),
    )
  }
}

export {
  Slider,
  type SliderConfig,
  type SliderAnimationConfig,
  type ResponsiveConfig,
}
