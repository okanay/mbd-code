// Interface'lere minimum değer ekleyelim
interface CounterItem {
  type: string
  dataAttribute: string
  textElementId: string
  minusButtonId: string
  plusButtonId: string
  countElementId: string
  containerId: string // Parent element ID'si eklendi
}

interface CounterConfig {
  value: number
  minValue: number
  maxValue: number // Maximum değer eklendi
  plusBtn: HTMLButtonElement | null
  minusBtn: HTMLButtonElement | null
  countElement: HTMLElement | null
  textElement: HTMLElement | null
  container: HTMLElement | null // Parent element referansı eklendi
}

export class InputCounter {
  private input: HTMLInputElement
  private counters: Map<string, CounterConfig> = new Map()
  private counterItems: CounterItem[]
  private observers: Map<string, MutationObserver> = new Map() // MutationObserver'lar için

  constructor(inputId: string, counterItems: CounterItem[]) {
    this.input = document.getElementById(inputId) as HTMLInputElement
    this.counterItems = counterItems
    if (!this.input) {
      console.error(`Input element with id ${inputId} not found`)
      return
    }
    this.initialize()
    this.bindEvents()
    this.setupObservers()
    this.updateInputValue()
  }

  private initialize() {
    this.counterItems.forEach(item => {
      const container = document.getElementById(item.containerId)
      const plusBtn = document.getElementById(item.plusButtonId)
      const minusBtn = document.getElementById(item.minusButtonId)
      const countElement = document.getElementById(item.countElementId)
      const textElement = document.getElementById(item.textElementId)

      const dataAttrName = item.dataAttribute.replace('data-', '')
      const initialValue = Number(this.input.dataset[dataAttrName] || 0)

      // Min ve max değerlerini container'dan al
      const minValue = Number(container?.dataset.min || 0)
      const maxValue = Number(container?.dataset.max || 99)

      if (countElement) {
        countElement.textContent = initialValue.toString()
      }

      this.counters.set(item.type, {
        value: initialValue,
        minValue,
        maxValue,
        plusBtn: plusBtn as HTMLButtonElement,
        minusBtn: minusBtn as HTMLButtonElement,
        countElement,
        textElement,
        container,
      })
    })

    this.updateButtonStates()
  }

  private setupObservers() {
    this.counters.forEach((config, type) => {
      if (config.container) {
        const observer = new MutationObserver(mutations => {
          mutations.forEach(mutation => {
            if (
              mutation.type === 'attributes' &&
              (mutation.attributeName === 'data-min' ||
                mutation.attributeName === 'data-max')
            ) {
              this.updateLimits(type)
            }
          })
        })

        observer.observe(config.container, {
          attributes: true,
          attributeFilter: ['data-min', 'data-max'],
        })

        this.observers.set(type, observer)
      }
    })
  }

  private updateLimits(type: string) {
    const config = this.counters.get(type)
    if (!config || !config.container) return

    const newMin = Number(config.container.dataset.min || 0)
    const newMax = Number(config.container.dataset.max || 99)

    config.minValue = newMin
    config.maxValue = newMax

    // Mevcut değeri yeni limitlere göre ayarla
    config.value = Math.min(Math.max(config.value, newMin), newMax)
    if (config.countElement) {
      config.countElement.textContent = config.value.toString()
    }

    this.updateInputValue()
    this.updateButtonStates()
  }

  private updateButtonStates() {
    this.counters.forEach(config => {
      if (config.minusBtn) {
        config.minusBtn.disabled = config.value <= config.minValue
      }
      if (config.plusBtn) {
        config.plusBtn.disabled = config.value >= config.maxValue
      }
    })
  }

  private updateCount(type: string, change: number) {
    const config = this.counters.get(type)
    if (!config) return

    const newValue = Math.min(
      Math.max(config.minValue, config.value + change),
      config.maxValue,
    )
    if (newValue === config.value) return

    config.value = newValue
    if (config.countElement) {
      config.countElement.textContent = newValue.toString()
    }

    this.updateInputValue()
    this.updateButtonStates()
  }

  private updateInputValue() {
    const parts: string[] = []
    this.counters.forEach((config, type) => {
      const translation = config.textElement?.textContent
      if (translation) {
        parts.push(`${config.value} ${translation}`)
      }
    })

    this.input.value = parts.join(', ')

    this.counterItems.forEach(item => {
      const config = this.counters.get(item.type)
      if (config) {
        const dataAttrName = item.dataAttribute.replace('data-', '')
        this.input.dataset[dataAttrName] = config.value.toString()
      }
    })

    this.updateButtonStates() // Butonların durumlarını güncelle
  }

  private bindEvents() {
    this.counterItems.forEach(item => {
      const config = this.counters.get(item.type)
      if (!config) return
      if (config.plusBtn) {
        config.plusBtn.addEventListener('click', () =>
          this.updateCount(item.type, 1),
        )
      }
      if (config.minusBtn) {
        config.minusBtn.addEventListener('click', () =>
          this.updateCount(item.type, -1),
        )
      }
    })
  }

  public reset() {
    this.counters.forEach(config => {
      config.value = config.minValue // 0 yerine minValue kullan
      if (config.countElement) {
        config.countElement.textContent = config.minValue.toString()
      }
    })
    this.updateInputValue()
  }
}
