interface CounterItem {
  type: string // adult, child, room vs.
  dataAttribute: string // data-adult, data-child vs.
  textElementId: string // adult-text, child-text vs.
  minusButtonId: string // adult-minus, child-minus vs.
  plusButtonId: string // adult-plus, child-plus vs.
  countElementId: string // adult-count, child-count vs.
}

interface CounterConfig {
  value: number
  plusBtn: HTMLButtonElement | null
  minusBtn: HTMLButtonElement | null
  countElement: HTMLElement | null
  textElement: HTMLElement | null
}

export class InputCounter {
  private input: HTMLInputElement
  private counters: Map<string, CounterConfig> = new Map()
  private counterItems: CounterItem[]

  constructor(inputId: string, counterItems: CounterItem[]) {
    this.input = document.getElementById(inputId) as HTMLInputElement
    this.counterItems = counterItems

    if (!this.input) {
      console.error(`Input element with id ${inputId} not found`)
      return
    }

    this.initialize()
    this.bindEvents()
    this.updateInputValue() // Set initial input text value
  }

  private initialize() {
    this.counterItems.forEach(item => {
      const plusBtn = document.getElementById(item.plusButtonId)
      const minusBtn = document.getElementById(item.minusButtonId)
      const countElement = document.getElementById(item.countElementId)
      const textElement = document.getElementById(item.textElementId)

      // Get initial value from data attribute
      const dataAttrName = item.dataAttribute.replace('data-', '')
      const initialValue = Number(this.input.dataset[dataAttrName] || 0)

      if (countElement) {
        countElement.textContent = initialValue.toString()
      }

      this.counters.set(item.type, {
        value: initialValue,
        plusBtn: plusBtn as HTMLButtonElement,
        minusBtn: minusBtn as HTMLButtonElement,
        countElement,
        textElement,
      })
    })
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

  private updateCount(type: string, change: number) {
    const config = this.counters.get(type)
    if (!config) return

    const newValue = Math.max(0, config.value + change)
    if (newValue === config.value) return

    config.value = newValue
    if (config.countElement) {
      config.countElement.textContent = newValue.toString()
    }

    this.updateInputValue()
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

    // Update data attributes
    this.counterItems.forEach(item => {
      const config = this.counters.get(item.type)
      if (config) {
        const dataAttrName = item.dataAttribute.replace('data-', '')
        this.input.dataset[dataAttrName] = config.value.toString()
      }
    })
  }

  public reset() {
    this.counters.forEach(config => {
      config.value = 0
      if (config.countElement) {
        config.countElement.textContent = '0'
      }
    })
    this.updateInputValue()
  }
}
