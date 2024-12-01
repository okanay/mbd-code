interface HeightCalculationConfig {
  id: string
  containerSelector: string
  parentIndex?: number // Hangi config'in parent olduğunu belirtmek için
  toggleConfig?: {
    inputSelector: string
    labelSelector: string
  }
  contentConfig: {
    contentSelector: string
    innerSelector?: string
    heightVariable: string
  }
}

interface StateConfig {
  attribute: string // Örn: 'data-state'
  activeValue: string // Örn: 'open'
  inactiveValue: string // Örn: 'closed'
}

export class DynamicHeightCalculator {
  private resizeTimer: number | null = null
  private observer: MutationObserver
  private configurations: HeightCalculationConfig[]
  private activeElements: Set<HTMLElement> = new Set()
  private heightCache: Map<string, string> = new Map()
  private stateConfig: StateConfig

  constructor(
    configurations: HeightCalculationConfig[],
    stateConfig: StateConfig,
  ) {
    this.configurations = configurations
    this.stateConfig = stateConfig
    this.observer = new MutationObserver(mutations => {
      const relevantChanges = mutations.some(mutation => {
        const target = mutation.target as HTMLElement

        if (mutation.type === 'attributes') {
          if (
            mutation.attributeName === 'style' &&
            target.style.height !== mutation.oldValue
          ) {
            return true
          }
          if (mutation.attributeName === this.stateConfig.attribute) {
            const newState = target.getAttribute(this.stateConfig.attribute)
            if (newState === this.stateConfig.activeValue) {
              this.restoreHeights()
              return false
            }
          }
        }
        return false
      })

      if (relevantChanges) {
        if (this.resizeTimer) {
          clearTimeout(this.resizeTimer)
        }
        this.resizeTimer = window.setTimeout(() => this.recalculateAll(), 50)
      }
    })

    this.initialize()
  }

  public initialize(): void {
    this.initializeToggles()
    this.calculateAllHeights()
    this.setupEventListeners()
    this.setupObservers()
  }

  private initializeToggles(): void {
    this.configurations.forEach((config, currentIndex) => {
      if (!config.toggleConfig) return

      const containers = document.querySelectorAll(config.containerSelector)
      containers.forEach((container, index) => {
        const input = container.querySelector(
          config.toggleConfig!.inputSelector,
        ) as HTMLInputElement

        if (input) {
          const uniqueId = `${config.id}-toggle-${index}`
          input.id = uniqueId

          // Input change event listener
          input.addEventListener('change', e => {
            const isChecked = (e.target as HTMLInputElement).checked
            if (isChecked) {
              this.activeElements.add(container as HTMLElement)
            } else {
              this.activeElements.delete(container as HTMLElement)
            }

            // Önce kendisini hesapla
            this.calculateContainerHeight(container as HTMLElement, config)

            // Eğer parent index tanımlıysa, parent container'ı da güncelle
            if (typeof config.parentIndex === 'number') {
              const parentConfig = this.configurations[config.parentIndex]
              if (parentConfig) {
                // En yakın parent container'ı bul
                const parentContainer = (container as HTMLElement).closest(
                  parentConfig.containerSelector,
                ) as HTMLElement
                if (parentContainer) {
                  this.calculateContainerHeight(parentContainer, parentConfig)
                }
              }
            }
          })

          // Label için for attribute'u
          const label = container.querySelector(
            config.toggleConfig!.labelSelector,
          ) as HTMLLabelElement
          if (label) {
            label.setAttribute('for', uniqueId)
          }

          // Mobil/Desktop davranış kontrolü için
          if (currentIndex > 0) {
            // Child elementler için
            label?.addEventListener('click', e => {
              if (window.innerWidth >= 640) {
                // sm breakpoint
                e.preventDefault()
                return
              }
            })
          }
        }
      })
    })
  }

  private getExpandedHeight(element: HTMLElement): number {
    // Geçici olarak visibility:hidden ile göster ve yüksekliği ölç
    const originalStyles = {
      position: element.style.position,
      visibility: element.style.visibility,
      height: element.style.height,
      display: element.style.display,
    }

    Object.assign(element.style, {
      position: 'absolute',
      visibility: 'hidden',
      height: 'auto',
      display: 'block',
    })

    const height = element.scrollHeight

    // Orijinal stilleri geri yükle
    Object.assign(element.style, originalStyles)

    return height
  }

  private async calculateAllHeights() {
    // Önce tüm container'ları hesapla
    for (const config of this.configurations) {
      const containers = document.querySelectorAll(config.containerSelector)
      containers.forEach(container => {
        this.calculateContainerHeight(container as HTMLElement, config)
      })
    }
  }

  private calculateContainerHeight(
    container: HTMLElement,
    config: HeightCalculationConfig,
  ) {
    const content = container.querySelector(
      config.contentConfig.contentSelector,
    ) as HTMLElement

    if (!content) return

    // Parent view state kontrolü - artık dinamik state kullanıyor
    const parentView = container.closest(`[${this.stateConfig.attribute}]`)
    if (
      parentView &&
      parentView.getAttribute(this.stateConfig.attribute) ===
        this.stateConfig.inactiveValue
    ) {
      return
    }

    let totalHeight = 0

    if (config.contentConfig.innerSelector) {
      const inner = content.querySelector(
        config.contentConfig.innerSelector,
      ) as HTMLElement

      if (inner) {
        totalHeight = this.getExpandedHeight(inner)
      }
    } else {
      totalHeight = this.getExpandedHeight(content)
    }

    const cacheKey = this.getCacheKey(container, config)
    this.heightCache.set(cacheKey, `${totalHeight}px`)

    container.style.setProperty(
      config.contentConfig.heightVariable,
      `${totalHeight}px`,
    )

    if (typeof config.parentIndex === 'number') {
      const parentConfig = this.configurations[config.parentIndex]
      if (parentConfig) {
        const parentContainer = container.closest(
          parentConfig.containerSelector,
        ) as HTMLElement
        if (parentContainer) {
          this.calculateContainerHeight(parentContainer, parentConfig)
        }
      }
    }
  }

  public recalculateAll(): void {
    this.calculateAllHeights()
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer)
      }
      this.resizeTimer = window.setTimeout(() => this.recalculateAll(), 100)
    })
  }

  private getCacheKey(
    container: HTMLElement,
    config: HeightCalculationConfig,
  ): string {
    // Benzersiz bir cache key oluştur
    return `${container.className}-${config.contentConfig.heightVariable}`
  }

  public restoreHeights(): void {
    this.configurations.forEach(config => {
      const containers = document.querySelectorAll(config.containerSelector)
      containers.forEach(container => {
        const cacheKey = this.getCacheKey(container as HTMLElement, config)
        const cachedHeight = this.heightCache.get(cacheKey)

        if (cachedHeight) {
          // Cache'den height değerini geri yükle
          ;(container as HTMLElement).style.setProperty(
            config.contentConfig.heightVariable,
            cachedHeight,
          )
        }
      })
    })
  }

  private setupObservers(): void {
    this.configurations.forEach(config => {
      const containers = document.querySelectorAll(config.containerSelector)
      containers.forEach(container => {
        this.observer.observe(container, {
          attributes: true,
          childList: true,
          subtree: true,
          attributeOldValue: true,
          attributeFilter: ['style', this.stateConfig.attribute],
        })

        const parentView = container.closest(`[${this.stateConfig.attribute}]`)
        if (parentView) {
          this.observer.observe(parentView, {
            attributes: true,
            attributeOldValue: true,
            attributeFilter: [this.stateConfig.attribute],
          })
        }
      })
    })
  }
}
