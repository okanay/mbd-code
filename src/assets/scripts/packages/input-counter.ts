// Interface'lere minimum değer ekleyelim
interface CounterItem {
  type: string
  dataAttribute: string
  textElementId: string
  minusButtonId: string
  plusButtonId: string
  countElementId: string
  minValue?: number // Opsiyonel minimum değer
}

interface CounterConfig {
  value: number
  minValue: number // Minimum değer eklendi
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
    this.updateInputValue()
  }

  private initialize() {
    this.counterItems.forEach(item => {
      const plusBtn = document.getElementById(item.plusButtonId)
      const minusBtn = document.getElementById(item.minusButtonId)
      const countElement = document.getElementById(item.countElementId)
      const textElement = document.getElementById(item.textElementId)

      const dataAttrName = item.dataAttribute.replace('data-', '')
      const initialValue = Number(this.input.dataset[dataAttrName] || 0)

      if (countElement) {
        countElement.textContent = initialValue.toString()
      }

      this.counters.set(item.type, {
        value: initialValue,
        minValue: item.minValue || 0, // Eğer minValue belirtilmemişse 0 kullan
        plusBtn: plusBtn as HTMLButtonElement,
        minusBtn: minusBtn as HTMLButtonElement,
        countElement,
        textElement,
      })
    })

    // İlk yüklemede butonların durumlarını güncelle
    this.updateButtonStates()
  }

  private updateButtonStates() {
    this.counters.forEach(config => {
      if (config.minusBtn) {
        // Değer minimum değere eşit veya küçükse minus butonu disabled olsun
        config.minusBtn.disabled = config.value <= config.minValue
      }
    })
  }

  private updateCount(type: string, change: number) {
    const config = this.counters.get(type)
    if (!config) return

    const newValue = Math.max(config.minValue, config.value + change)
    if (newValue === config.value) return

    config.value = newValue
    if (config.countElement) {
      config.countElement.textContent = newValue.toString()
    }

    this.updateInputValue()
    this.updateButtonStates() // Butonların durumlarını güncelle
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
