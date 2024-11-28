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
  defaultActiveIndex?: number
  activeButtonClass?: string
  activeButtonClassTarget?: string
  auto?: boolean
  autoInterval?: number
  responsive?: ResponsiveConfig
  onIndexChange?: (index?: number) => void
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
  private activeIndex: number
  private isAnimating: boolean
  private activeButtonClass: string
  private activeButtonClassTarget: string
  private autoEnabled: boolean
  private autoInterval: number
  private autoTimer: NodeJS.Timeout | null
  private onIndexChange?: (index?: number) => void
  private lastDirection: 'left' | 'right' = 'right'
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

  private initialConfig: SliderConfig
  private queuedTransition: boolean = false

  constructor(config: SliderConfig) {
    this.container =
      typeof config.container === 'string'
        ? (document.querySelector(config.container) as HTMLElement)
        : config.container

    if (!this.container) {
      throw new Error('Container element not found')
    }

    this.slider = this.container.querySelector('ul') as HTMLElement
    if (!this.slider) {
      throw new Error('Slider element not found')
    }

    this.slides = this.container.querySelectorAll(config.slideSelector)
    this.buttons = document.querySelectorAll(config.buttonSelector)

    if (!this.slides.length || !this.buttons.length) {
      throw new Error('Slides or buttons not found')
    }

    this.initialConfig = { ...config }

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

    this.responsiveConfig = {
      enabled: config.responsive?.enabled ?? false,
      minWidth: config.responsive?.minWidth ?? 0,
      maxWidth: config.responsive?.maxWidth ?? 9999,
    }

    this.activeIndex = config.defaultActiveIndex || 0
    this.isAnimating = false
    this.activeButtonClass = config.activeButtonClass || 'slider-active-btn'
    this.activeButtonClassTarget =
      config.activeButtonClassTarget || config.buttonSelector
    this.autoEnabled = config.auto || false
    this.autoInterval = config.autoInterval || 5000
    this.autoTimer = null
    this.options = config.options || {
      zIndex: {
        clone: 60,
        selected: 50,
        notSelected: -10,
      },
    }
    this.onIndexChange = config.onIndexChange
    this.resizeObserver = null
    this.applyInitialStyles()
    this.init()
  }

  private init(): void {
    if (this.slides.length > 0) {
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

    if (this.autoEnabled) {
      this.container.addEventListener('mouseenter', () => this.pauseAutoPlay())
      this.container.addEventListener('mouseleave', () => this.resumeAutoPlay())
      this.startAutoPlay()
    }

    this.initResizeObserver()
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
    const windowWidth = window.innerWidth
    const isNowEnabled =
      windowWidth >= this.responsiveConfig.minWidth &&
      windowWidth <= this.responsiveConfig.maxWidth

    if (wasEnabled !== isNowEnabled) {
      if (isNowEnabled) {
        this.enableSlider()
        // Config'i tekrar uygula
        this.updateAnimationConfig(this.initialConfig.animationConfig || {})
        if (this.initialConfig.auto) {
          this.enableAutoPlay()
        }
      } else {
        this.disableSlider()
        // Animasyonları sıfırla
        this.resetAllAnimations()
      }
    } else if (!isNowEnabled && this.isAnimating) {
      // Eğer zaten disabled durumunda ise ve animasyon devam ediyorsa
      this.resetAllAnimations()
    }

    // Her resize durumunda animasyonları geçici olarak devre dışı bırak
    this.slides.forEach((slide: HTMLElement) => {
      slide.style.transition = 'none'
    })

    // RequestAnimationFrame ile transition'ı geri getir
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
      !this.isSliderEnabled() ||
      this.isAnimating ||
      targetIndex === this.activeIndex
    )
      return
    if (targetIndex < 0 || targetIndex >= this.slides.length) return
    this.onIndexChange && this.onIndexChange(targetIndex)

    // prettier-ignore
    const slideDirection = direction || (targetIndex > this.activeIndex ? "right" : targetIndex < this.activeIndex ? "left" : this.lastDirection);
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
