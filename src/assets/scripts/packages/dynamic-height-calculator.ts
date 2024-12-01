interface HeightCalculationConfig {
  id: string
  containerSelector: string
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

export class DynamicHeightCalculator {
  private resizeTimer: number | null = null
  private observer: MutationObserver
  private configurations: HeightCalculationConfig[]
  private activeElements: Set<HTMLElement> = new Set()

  constructor(configurations: HeightCalculationConfig[]) {
    this.configurations = configurations
    this.observer = new MutationObserver(mutations => {
      // Sadece height değişikliklerini izle
      const heightChanged = mutations.some(mutation => {
        const target = mutation.target as HTMLElement
        return target.style.height !== mutation.oldValue
      })

      if (heightChanged) {
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
    this.configurations.forEach(config => {
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
            this.recalculateAll()
          })

          // Label için for attribute'u
          const label = container.querySelector(
            config.toggleConfig!.labelSelector,
          ) as HTMLLabelElement
          if (label) {
            label.setAttribute('for', uniqueId)
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

    // CSS değişkenini güncelle
    container.style.setProperty(
      config.contentConfig.heightVariable,
      `${totalHeight}px`,
    )

    // Parent container varsa onu da güncelle
    this.updateParentContainer(container)
  }

  private updateParentContainer(element: HTMLElement) {
    const parent = this.findParentContainer(element)
    if (parent) {
      const parentConfig = this.findConfigForContainer(parent)
      if (parentConfig) {
        this.calculateContainerHeight(parent, parentConfig)
      }
    }
  }

  private findParentContainer(element: HTMLElement): HTMLElement | null {
    let parent = element.parentElement
    while (parent) {
      if (
        this.configurations.some(config =>
          parent?.matches(config.containerSelector),
        )
      ) {
        return parent
      }
      parent = parent.parentElement
    }
    return null
  }

  private findConfigForContainer(
    container: HTMLElement,
  ): HeightCalculationConfig | null {
    return (
      this.configurations.find(config =>
        container.matches(config.containerSelector),
      ) || null
    )
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

  private setupObservers(): void {
    this.configurations.forEach(config => {
      const containers = document.querySelectorAll(config.containerSelector)
      containers.forEach(container => {
        this.observer.observe(container, {
          attributes: true,
          childList: true,
          subtree: true,
          attributeOldValue: true,
          attributeFilter: ['style'],
        })
      })
    })
  }
}
