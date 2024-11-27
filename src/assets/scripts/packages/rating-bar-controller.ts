interface RatingBarConfig {
  containerSelector: string
  barSelector: string
  totalAttribute?: string
  rateAttribute?: string
  animationDuration?: number
  onBarUpdate?: (element: HTMLElement, percentage: number) => void
  modalId?: string
}

class RatingBarController {
  private config: Required<RatingBarConfig>
  private container: HTMLElement | null = null
  private bars: HTMLElement[] = []
  private totalValue: number = 0
  private hasAnimated: boolean = false
  private initialUrlChecked: boolean = false
  private modalElement: HTMLElement | null = null

  constructor(config: RatingBarConfig) {
    this.config = {
      containerSelector: config.containerSelector,
      barSelector: config.barSelector,
      totalAttribute: config.totalAttribute || 'data-total-comments',
      rateAttribute: config.rateAttribute || 'data-rate',
      animationDuration: config.animationDuration || 500,
      onBarUpdate: config.onBarUpdate || this.defaultBarUpdate.bind(this),
      modalId: config.modalId || '',
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init())
    } else {
      this.init()
    }
  }

  private init(): void {
    this.initialize()
    this.setupModalHandlers()
  }

  private setupModalHandlers(): void {
    if (!this.config.modalId) return

    if (!this.initialUrlChecked) {
      const urlParams = new URLSearchParams(window.location.search)
      const modalParam = urlParams.get('m') // Modal Controller ile uyumlu sabit parametre

      if (modalParam === this.config.modalId) {
        this.modalElement = document.getElementById(this.config.modalId)
        if (this.modalElement && this.isModalVisible(this.modalElement)) {
          this.animate()
        }
      }
      this.initialUrlChecked = true
    }
  }

  private isModalVisible(modal: HTMLElement): boolean {
    const style = window.getComputedStyle(modal)
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      modal.offsetParent !== null
    )
  }

  public handleModalToggle(modalId: string, isOpen: boolean): void {
    if (modalId === this.config.modalId && isOpen && !this.hasAnimated) {
      this.animate()
    }
  }

  private initialize(): void {
    this.container = document.querySelector(this.config.containerSelector)
    if (!this.container) {
      console.warn(`Container not found: ${this.config.containerSelector}`)
      return
    }

    this.totalValue = Number(
      this.container.getAttribute(this.config.totalAttribute) || 0,
    )

    this.bars = Array.from(
      this.container.querySelectorAll(this.config.barSelector),
    ).filter((el): el is HTMLElement => el instanceof HTMLElement)

    this.bars.forEach(bar => {
      bar.style.width = '0%'
      bar.style.transition = `width ${this.config.animationDuration}ms ease-out`
    })
  }

  private defaultBarUpdate(element: HTMLElement, percentage: number): void {
    element.style.width = `${percentage}%`
  }

  private updateBars(): void {
    if (this.totalValue === 0) return

    this.bars.forEach(bar => {
      const rate = Number(bar.getAttribute(this.config.rateAttribute) || 0)
      const percentage = (rate / this.totalValue) * 100
      this.config.onBarUpdate(bar, percentage)
    })
  }

  private animate(): void {
    if (this.hasAnimated || !this.container || !this.bars.length) return

    requestAnimationFrame(() => {
      this.updateBars()
      this.hasAnimated = true
    })
  }

  public reset(): void {
    this.hasAnimated = false
    this.initialize()
  }
}

export { RatingBarController }
export type { RatingBarConfig }
