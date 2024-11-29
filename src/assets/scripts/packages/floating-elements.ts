interface FloatingElement {
  id: string
  observeTargets?: {
    selector: string
    threshold?: {
      start: number
      end: number
    }
  }[]
  order: number
  initialPosition: Partial<CSSStyleDeclaration>
  activePosition?: Partial<CSSStyleDeclaration>
  animationOptions: {
    active: Partial<CSSStyleDeclaration>
    exit: Partial<CSSStyleDeclaration>
  }
  onClick?: () => void
}

interface ManagerConfig {
  elements: FloatingElement[]
  gap: number
  defaultThreshold?: {
    start: number
    end: number
  }
}

class FloatingElementsManager {
  private elements: Map<
    string,
    {
      config: FloatingElement
      element: HTMLElement
      observers: IntersectionObserver[]
      height: number
      isVisible: boolean
      isActive: boolean
      observerStates: Map<string, boolean>
    }
  > = new Map()

  private gap: number
  private defaultThreshold: { start: number; end: number }
  private activeElements: string[] = []

  constructor(config: ManagerConfig) {
    this.gap = config.gap
    this.defaultThreshold = config.defaultThreshold || { start: 0.7, end: 0.15 }

    requestAnimationFrame(() => {
      this.initializeElements(config.elements)
    })
  }

  private initializeElements(elements: FloatingElement[]): void {
    const sortedElements = [...elements].sort((a, b) => a.order - b.order)

    sortedElements.forEach(config => {
      const element = document.querySelector<HTMLElement>(`#${config.id}`)
      if (!element) {
        console.error(`Element not found: ${config.id}`)
        return
      }

      const height = element.offsetHeight

      Object.assign(element.style, {
        position: 'fixed',
        transition: 'all 0.3s ease-in-out',
        ...config.initialPosition,
      })

      this.elements.set(config.id, {
        config,
        element,
        observers: [],
        height,
        isVisible: false,
        isActive: true,
        observerStates: new Map(),
      })

      if (config.onClick) {
        element.addEventListener('click', config.onClick)
      }

      if (config.observeTargets) {
        this.setupObservers(config.id)
      }
    })

    this.updateActiveElements()
  }

  private setupObservers(elementId: string): void {
    const elementData = this.elements.get(elementId)
    if (!elementData?.config.observeTargets) return

    elementData.config.observeTargets.forEach(target => {
      const targetElement = document.querySelector(target.selector)
      if (!targetElement) return

      // Initialize observer state for this target
      elementData.observerStates.set(target.selector, true)

      const threshold = target.threshold || this.defaultThreshold
      const thresholdSteps = Array.from({ length: 100 }, (_, i) => i / 100)

      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            const ratio = entry.intersectionRatio
            const currentState = elementData.observerStates.get(target.selector)

            if (ratio >= threshold.start) {
              elementData.observerStates.set(target.selector, false)
            } else if (ratio <= threshold.end) {
              elementData.observerStates.set(target.selector, true)
            }

            // Only update if the state has changed
            if (
              currentState !== elementData.observerStates.get(target.selector)
            ) {
              this.updateElementState(elementId)
            }
          })
        },
        {
          threshold: thresholdSteps,
          rootMargin: '0px',
        },
      )

      observer.observe(targetElement)
      elementData.observers.push(observer)
    })
  }

  private updateElementState(elementId: string): void {
    const elementData = this.elements.get(elementId)
    if (!elementData) return

    // Element should be active only if ALL observers are in active state
    const shouldBeActive = Array.from(
      elementData.observerStates.values(),
    ).every(state => state)

    if (shouldBeActive !== elementData.isActive) {
      elementData.isActive = shouldBeActive
      if (shouldBeActive) {
        this.activateElement(elementId)
      } else {
        this.deactivateElement(elementId)
      }
    }
  }

  private activateElement(elementId: string): void {
    const elementData = this.elements.get(elementId)
    if (!elementData) return

    elementData.isActive = true
    this.updateActiveElements()
  }

  private deactivateElement(elementId: string): void {
    const elementData = this.elements.get(elementId)
    if (!elementData) return

    elementData.isActive = false
    this.hideElement(elementId)
    this.updateActiveElements()
  }

  private updateActiveElements(): void {
    this.activeElements = Array.from(this.elements.entries())
      .filter(([_, data]) => data.isActive)
      .sort((a, b) => a[1].config.order - b[1].config.order)
      .map(([id]) => id)

    this.recalculatePositions()
  }

  private showElement(elementId: string): void {
    const elementData = this.elements.get(elementId)
    if (!elementData || elementData.isVisible) return

    elementData.isVisible = true
    Object.assign(
      elementData.element.style,
      elementData.config.animationOptions.active,
    )
  }

  private hideElement(elementId: string): void {
    const elementData = this.elements.get(elementId)
    if (!elementData || !elementData.isVisible) return

    elementData.isVisible = false
    Object.assign(
      elementData.element.style,
      elementData.config.animationOptions.exit,
    )
  }

  private recalculatePositions(): void {
    let currentOffset = 0

    this.activeElements.forEach((elementId, index) => {
      const elementData = this.elements.get(elementId)
      if (!elementData) return

      const position =
        elementData.config.activePosition || elementData.config.initialPosition
      const bottom = parseInt((position.bottom as string) || '0')

      if (index > 0) {
        currentOffset += this.gap
      }

      Object.assign(elementData.element.style, {
        ...position,
        bottom: `${bottom + currentOffset}px`,
        transition: 'all 0.3s ease-in-out',
      })

      if (elementData.isActive) {
        this.showElement(elementId)
        currentOffset += elementData.height
      }
    })
  }

  public destroy(): void {
    this.elements.forEach(elementData => {
      elementData.observers.forEach(observer => observer.disconnect())
      elementData.element.removeEventListener(
        'click',
        elementData.config.onClick as any,
      )
    })
    this.elements.clear()
  }
}

export { FloatingElementsManager, type FloatingElement, type ManagerConfig }
