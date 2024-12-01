interface HeightCalculationConfig {
  id: string // Benzersiz tanımlayıcı
  containerSelector: string // Ana container selector
  toggleConfig?: {
    // Toggle düğmesi ayarları (opsiyonel)
    inputSelector: string
    labelSelector: string
  }
  contentConfig: {
    // İçerik ayarları
    contentSelector: string // İçerik alanı selector
    innerSelector?: string // İç içerik selector (opsiyonel)
    heightVariable: string // CSS değişken ismi
  }
}

export class DynamicHeightCalculator {
  private resizeTimer: number | null = null
  private observer: MutationObserver
  private configurations: HeightCalculationConfig[]

  constructor(configurations: HeightCalculationConfig[]) {
    this.configurations = configurations
    this.observer = new MutationObserver(() => this.recalculate())
    this.initialize()
  }

  public initialize(): void {
    this.initializeToggles()
    this.calculateHeights()
    this.setupEventListeners()
    this.setupObservers()
  }

  public recalculate(): void {
    this.calculateHeights()
  }

  private initializeToggles(): void {
    this.configurations.forEach(config => {
      if (!config.toggleConfig) return

      const containers = document.querySelectorAll(config.containerSelector)
      containers.forEach((container, index) => {
        const input = container.querySelector(
          config.toggleConfig!.inputSelector,
        ) as HTMLInputElement

        const label = container.querySelector(
          config.toggleConfig!.labelSelector,
        ) as HTMLLabelElement

        if (input && label) {
          const uniqueId = `${config.id}-toggle-${index}`
          input.id = uniqueId
          label.setAttribute('for', uniqueId)
        }
      })
    })
  }

  private calculateHeights(): void {
    this.configurations.forEach(config => {
      const containers = document.querySelectorAll(config.containerSelector)

      containers.forEach(container => {
        const content = container.querySelector(
          config.contentConfig.contentSelector,
        ) as HTMLElement

        if (!content) return

        let height: number

        if (config.contentConfig.innerSelector) {
          const inner = content.querySelector(
            config.contentConfig.innerSelector,
          ) as HTMLElement

          if (!inner) return

          // İç içerik için yükseklik hesaplama
          const originalStyles = {
            position: inner.style.position,
            visibility: inner.style.visibility,
            zIndex: inner.style.zIndex,
          }

          Object.assign(inner.style, {
            position: 'absolute',
            visibility: 'hidden',
            zIndex: '-1',
          })

          height = inner.scrollHeight

          Object.assign(inner.style, originalStyles)
        } else {
          // Doğrudan content yüksekliğini hesaplama
          height = content.scrollHeight
        }

        // Hesaplanan yüksekliği CSS değişkeni olarak ata
        if (container instanceof HTMLElement) {
          container.style.setProperty(
            config.contentConfig.heightVariable,
            `${height}px`,
          )
        }
      })
    })
  }

  private setupEventListeners(): void {
    window.addEventListener('resize', () => {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer)
      }
      this.resizeTimer = window.setTimeout(() => this.calculateHeights(), 100)
    })
  }

  private setupObservers(): void {
    this.configurations.forEach(config => {
      const containers = document.querySelectorAll(config.containerSelector)
      containers.forEach(container => {
        this.observer.observe(container, {
          childList: true,
          subtree: true,
          characterData: true,
        })
      })
    })
  }
}
