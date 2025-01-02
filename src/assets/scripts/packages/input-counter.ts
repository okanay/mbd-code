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

interface SelectItem {
  type: string
  dataAttribute: string
  selectElementId: string
  containerId: string
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
  private selects: Map<string, HTMLSelectElement> = new Map()
  private counterItems: CounterItem[]
  private selectItems: SelectItem[]
  private observers: Map<string, MutationObserver> = new Map()

  constructor(
    inputId: string,
    counterItems: CounterItem[],
    selectItems: SelectItem[],
  ) {
    this.input = document.getElementById(inputId) as HTMLInputElement
    this.counterItems = counterItems
    this.selectItems = selectItems

    if (!this.input) {
      console.error(`Input element with id ${inputId} not found`)
      return
    }

    this.initialize()
    this.bindEvents()
    this.setupObservers()
    this.updateInputValue()

    // Manager'a kaydet
    InputCounterManager.addInstance(inputId, this)
  }

  private initialize() {
    // Counter'ları başlat
    this.initializeCounters()
    // Select'leri başlat
    this.initializeSelects()
  }

  public refresh(): void {
    // Counter'ları yenile
    this.counters.forEach((config, type) => {
      console.log(`Refreshing counter of type: ${type}`)

      // Limitleri güncelle
      if (config.container) {
        const newMin = Number(config.container.dataset.min || 0)
        const newMax = Number(config.container.dataset.max || 99)
        console.log(
          `Updating limits for type ${type}: min=${newMin}, max=${newMax}`,
        )
        config.minValue = newMin
        config.maxValue = newMax
      }

      // Değeri limitlere göre ayarla
      const oldValue = config.value
      config.value = Math.min(
        Math.max(config.value, config.minValue),
        config.maxValue,
      )
      console.log(
        `Adjusted value for type ${type}: from ${oldValue} to ${config.value}`,
      )

      // Görünümü güncelle
      if (config.countElement) {
        config.countElement.textContent = config.value.toString()
        console.log(`Updated count element for type ${type}: ${config.value}`)
      }
    })

    // Select'leri yenile
    this.selectItems.forEach(item => {
      const select = this.selects.get(item.type)
      if (select) {
        const dataAttrName = item.dataAttribute.replace('data-', '')
        this.input.dataset[dataAttrName] = select.value
        console.log(`Updated select for type ${item.type}: ${select.value}`)
      }
    })

    // Input değerini güncelle
    this.updateInputValue()
    console.log('Input value updated')
  }

  private initializeCounters() {
    this.counterItems.forEach(item => {
      const container = document.getElementById(item.containerId)
      const plusBtn = document.getElementById(item.plusButtonId)
      const minusBtn = document.getElementById(item.minusButtonId)
      const countElement = document.getElementById(item.countElementId)
      const textElement = document.getElementById(item.textElementId)

      const dataAttrName = item.dataAttribute.replace('data-', '')
      const initialValue = Number(this.input.dataset[dataAttrName] || 0)

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
  }

  private initializeSelects() {
    this.selectItems.forEach(item => {
      const select = document.getElementById(
        item.selectElementId,
      ) as HTMLSelectElement
      if (select) {
        this.selects.set(item.type, select)
        const dataAttrName = item.dataAttribute.replace('data-', '')

        // Select değeri değiştiğinde input'u güncelle
        select.addEventListener('change', () => {
          this.input.dataset[dataAttrName] = select.value
          this.updateInputValue()
        })

        // Başlangıç değerini ayarla
        this.input.dataset[dataAttrName] = select.value
      }
    })
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

  public updateInputValue(): void {
    const parts: string[] = []

    // Select değerlerini ekle
    this.selectItems.forEach(item => {
      const select = this.selects.get(item.type)
      if (select) {
        parts.push(select.value)
      }
    })

    // Counter değerlerini ekle
    this.counters.forEach((config, type) => {
      const translation = config.textElement?.textContent
      if (translation) {
        parts.push(`${config.value} ${translation}`)
      }
    })

    this.input.value = parts.join(', ')
    this.updateButtonStates()
  }
}

// Manager sınıfı
class InputCounterManager {
  private static instances: Map<string, InputCounter> = new Map()

  static addInstance(id: string, instance: InputCounter): void {
    this.instances.set(id, instance)
  }

  static getInstance(id: string): InputCounter | undefined {
    return this.instances.get(id)
  }

  static refreshInstance(id: string): boolean {
    const instance = this.instances.get(id)
    if (instance) {
      try {
        instance.refresh()
        return true
      } catch (error) {
        console.error(`Error refreshing input counter ${id}:`, error)
        return false
      }
    }
    return false
  }

  static refreshAll(): boolean {
    let success = true
    this.instances.forEach((instance, id) => {
      try {
        instance.refresh()
      } catch (error) {
        console.error(`Error refreshing input counter ${id}:`, error)
        success = false
      }
    })
    return success
  }
}

// Window interface genişletmesi
declare global {
  interface Window {
    RefreshTextInput: (inputId: string) => boolean
    RefreshAllTextInputs: () => boolean
  }
}

// Window metodlarını tanımla
window.RefreshTextInput = function (inputId: string): boolean {
  return InputCounterManager.refreshInstance(inputId)
}

window.RefreshAllTextInputs = function (): boolean {
  return InputCounterManager.refreshAll()
}
