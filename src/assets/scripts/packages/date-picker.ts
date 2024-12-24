const DEFAULT_CLASSES = {
  calendar: {
    grid: 'calendar-grid',
    dayHeader: 'day-header',
  },
  wrapper: {
    base: 'wrapper',
    hidden: 'date-hidden', // Changed default hidden class name
  },
  month: {
    container: 'month-container',
    current: 'month-current',
    pointer: {
      prev: {
        base: 'prev-pointer',
        disabled: 'prev-disabled',
      },
      next: {
        base: 'next-pointer',
        disabled: 'next-disabled',
      },
    },
  },
  day: {
    base: 'day',
    disabled: 'day-disabled',
    selected: 'day-selected',
    empty: 'day-empty',
    linked: 'day-linked',
    currentInput: 'current-input-date',
    linkedHighlight: 'linked-date-highlight',
    betweenStart: 'date-between-start',
    betweenEnd: 'date-between-end',
    between: 'date-between',
  },
} as const

interface LanguageConfig {
  language: string
  monthNames: string[]
  dayNames: string[]
}

type DatePickerInputType = 'single' | 'two' | 'between'

interface SingleDateInput {
  id: string
  focusContainer?: string
}

interface BetweenDateInput {
  id: string
  focusContainer?: string
}

interface DateRangeInput {
  start: {
    id: string
    focusContainer?: string
  }
  end: {
    id: string
    focusContainer?: string
  }
}

interface RegisteredInput {
  element: HTMLInputElement
  type: 'single' | 'start' | 'end'
  linkedInputId?: string
  focusContainerId?: string
}

interface DatePickerInputConfig {
  type: DatePickerInputType
  elements: SingleDateInput | DateRangeInput | BetweenDateInput
}

interface RegisteredInput {
  element: HTMLInputElement
  type: 'single' | 'start' | 'end'
  linkedInputId?: string
}

interface DayClasses {
  base?: string
  disabled?: string
  selected?: string
  empty?: string
  linked?: string
  currentInput?: string
  linkedHighlight?: string
  betweenStart?: string
  betweenEnd?: string
  between?: string
}

interface MonthPointerClasses {
  base?: string
  disabled?: string
}

interface MonthClasses {
  container?: string
  current?: string
  buttons?: {
    prev?: MonthPointerClasses
    next?: MonthPointerClasses
  }
}

interface CalendarClasses {
  grid?: string
  dayHeader?: string
}

interface WrapperClasses {
  base?: string
  hidden?: string
}

interface DatePickerClasses {
  day?: DayClasses
  month?: MonthClasses
  calendar?: CalendarClasses
  wrapper?: WrapperClasses
}

interface OutputConfig {
  order: string[] // ["day", "month", "year"]
  slash: string // "/" or "-" or "."
  between: string // " - " or " to "
  fullFormat?: boolean
  backendFormat?: string[] // Yeni alan: Backend formatı için
}

interface DefaultDates {
  single?: Date
  between?: {
    start?: Date
    end?: Date
  }
  two?: {
    start?: Date
    end?: Date
  }
}

interface DatePickerConfig {
  elements: {
    container: string
    monthContainer: string
    daysContainer: string
    buttons: {
      prev: string
      next: string
      reset?: string
      resetAll?: string
      close?: string // Yeni, opsiyonel close butonu
    }
  }
  input: DatePickerInputConfig
  classes?: DatePickerClasses
  language: LanguageConfig[]
  output?: OutputConfig
  defaultDates?: DefaultDates
  minDate?: Date
  maxDate?: Date
  autoClose?: boolean
  autoSwitchInput?: boolean
}

class DatePicker {
  private config: DatePickerConfig
  private classes: Required<DatePickerClasses>
  private currentDate: Date
  private selectedDate: Date | null = null
  private monthShortNamePointer: HTMLElement | null
  private daysContainer: HTMLElement | null
  private containerElement: HTMLElement | null
  private activeInput: HTMLInputElement | null = null
  private prevButton: HTMLElement | null = null
  private nextButton: HTMLElement | null = null
  private resetButton: HTMLElement | null = null
  private resetAllButton: HTMLElement | null = null
  private registeredInputs: Map<string, RegisteredInput> = new Map()
  private focusContainers: Map<string, HTMLElement> = new Map()
  private dateValues: Map<string, Date> = new Map()
  private selectedDates: Map<string, Date> = new Map()
  private autoClose = true
  private autoSwitchInput = true
  private outputConfig: OutputConfig = {
    order: ['day', 'month', 'year'],
    slash: '/',
    between: ' - ',
  }

  private betweenStartDate: Date | null = null
  private betweenEndDate: Date | null = null
  private isBetweenSelectionActive = false
  private closeButton: HTMLElement | null = null

  constructor(config: DatePickerConfig) {
    this.config = config
    this.classes = this.mergeClasses(DEFAULT_CLASSES, config.classes || {})

    // Reset hours, minutes, seconds, and milliseconds for consistent date comparison
    this.currentDate = this.stripTime(new Date())
    this.selectedDate = this.stripTime(new Date())

    this.autoClose = config.autoClose || this.autoClose
    this.autoSwitchInput = config.autoSwitchInput || this.autoSwitchInput

    this.outputConfig = config.output || this.outputConfig

    // Also strip time from min and max dates
    if (this.config.minDate) {
      this.config.minDate = this.stripTime(this.config.minDate)
    }
    if (this.config.maxDate) {
      this.config.maxDate = this.stripTime(this.config.maxDate)
    }

    if (config.defaultDates) {
      this.initializeDefaultDates(config.defaultDates)
    }

    this.monthShortNamePointer = document.getElementById(
      config.elements.monthContainer,
    )
    this.daysContainer = document.getElementById(config.elements.daysContainer)
    this.containerElement = document.getElementById(config.elements.container)
    this.prevButton = document.getElementById(config.elements.buttons.prev)
    this.nextButton = document.getElementById(config.elements.buttons.next)

    if (config.elements.buttons.reset) {
      this.resetButton = document.getElementById(config.elements.buttons.reset)
    }

    if (config.elements.buttons.resetAll) {
      this.resetAllButton = document.getElementById(
        config.elements.buttons.resetAll,
      )
    }

    if (config.elements.buttons.close) {
      this.closeButton = document.getElementById(config.elements.buttons.close)
    }

    if (
      !this.monthShortNamePointer ||
      !this.daysContainer ||
      !this.containerElement
    ) {
      console.warn('One or more container elements not found.')
    } else {
      this.initializeDatePicker()
      this.initializeInputs()
      this.addEventListeners()
      this.initializeFocusContainers()
    }

    window.addEventListener('resize', this.handleWindowResize)

    this.hideDatePicker()
  }

  private initializeDefaultDates(defaultDates: DefaultDates) {
    const { input } = this.config

    if (input.type === 'single' && defaultDates.single) {
      const dateInput = document.getElementById(
        (input.elements as SingleDateInput).id,
      ) as HTMLInputElement

      if (dateInput) {
        const date = this.stripTime(defaultDates.single)
        this.selectedDates.set(dateInput.id, date)
        this.dateValues.set(dateInput.id, date)
        dateInput.value = this.formatDateBasedOnConfig(date)
        dateInput.setAttribute(
          'data-selected',
          this.formatDateBasedOnConfig(date, 'backend'),
        )
      }
    }

    if (input.type === 'between' && defaultDates.between) {
      const dateInput = document.getElementById(
        (input.elements as BetweenDateInput).id,
      ) as HTMLInputElement

      if (dateInput && defaultDates.between.start && defaultDates.between.end) {
        const startDate = this.stripTime(defaultDates.between.start)
        const endDate = this.stripTime(defaultDates.between.end)

        this.betweenStartDate = startDate
        this.betweenEndDate = endDate

        this.selectedDates.set(`${dateInput.id}-start`, startDate)
        this.selectedDates.set(`${dateInput.id}-end`, endDate)
        this.dateValues.set(`${dateInput.id}-start`, startDate)
        this.dateValues.set(`${dateInput.id}-end`, endDate)

        const output = this.config.output || {
          order: ['day', 'month', 'year'],
          slash: '/',
          between: ' - ',
        }

        dateInput.value = `${this.formatDateBasedOnConfig(startDate)}${output.between}${this.formatDateBasedOnConfig(endDate)}`
        dateInput.setAttribute(
          'data-start',
          this.formatDateBasedOnConfig(startDate, 'backend'),
        )
        dateInput.setAttribute(
          'data-end',
          this.formatDateBasedOnConfig(endDate, 'backend'),
        )
      }
    }

    if (input.type === 'two' && defaultDates.two) {
      const rangeConfig = input.elements as DateRangeInput

      if (defaultDates.two.start) {
        const startInput = document.getElementById(
          rangeConfig.start.id,
        ) as HTMLInputElement
        if (startInput) {
          const startDate = this.stripTime(defaultDates.two.start)
          this.selectedDates.set(startInput.id, startDate)
          this.dateValues.set(startInput.id, startDate)
          startInput.value = this.formatDateBasedOnConfig(startDate)
          startInput.setAttribute(
            'data-start',
            this.formatDateBasedOnConfig(startDate, 'backend'),
          )
        }
      }

      if (defaultDates.two.end) {
        const endInput = document.getElementById(
          rangeConfig.end.id,
        ) as HTMLInputElement
        if (endInput) {
          const endDate = this.stripTime(defaultDates.two.end)
          this.selectedDates.set(endInput.id, endDate)
          this.dateValues.set(endInput.id, endDate)
          endInput.value = this.formatDateBasedOnConfig(endDate)
          endInput.setAttribute(
            'data-end',
            this.formatDateBasedOnConfig(endDate, 'backend'),
          )
        }
      }
    }
  }

  private initializeFocusContainers() {
    const { input } = this.config

    if (input.type === 'single') {
      const singleConfig = input.elements as SingleDateInput
      if (singleConfig.focusContainer) {
        const container = document.getElementById(singleConfig.focusContainer)
        if (container) {
          this.focusContainers.set(singleConfig.id, container)
        }
      }
    } else if (input.type === 'two') {
      const rangeConfig = input.elements as DateRangeInput

      if (rangeConfig.start.focusContainer) {
        const startContainer = document.getElementById(
          rangeConfig.start.focusContainer,
        )
        if (startContainer) {
          this.focusContainers.set(rangeConfig.start.id, startContainer)
        }
      }

      if (rangeConfig.end.focusContainer) {
        const endContainer = document.getElementById(
          rangeConfig.end.focusContainer,
        )
        if (endContainer) {
          this.focusContainers.set(rangeConfig.end.id, endContainer)
        }
      }
    }
  }

  private updateFocusContainer(inputId: string | null, isFocused: boolean) {
    if (!inputId) return

    // Önce tüm containerlardaki focus'u kaldır
    this.focusContainers.forEach(container => {
      container.setAttribute('data-focus', 'false')
    })

    // Aktif input'un container'ını güncelle
    const container = this.focusContainers.get(inputId)
    if (container) {
      container.setAttribute('data-focus', isFocused ? 'true' : 'false')
    }
  }

  private mergeClasses(
    defaults: DatePickerClasses,
    custom: DatePickerClasses,
  ): Required<DatePickerClasses> {
    const merged = { ...defaults }

    if (custom.day) {
      merged.day = {
        ...defaults.day,
        ...custom.day,
      }
    }

    if (custom.month) {
      merged.month = {
        ...defaults.month,
        ...custom.month,
        buttons: {
          prev: {
            ...defaults.month?.buttons?.prev,
            ...custom.month?.buttons?.prev,
          },
          next: {
            ...defaults.month?.buttons?.next,
            ...custom.month?.buttons?.next,
          },
        },
      }
    }

    if (custom.calendar) {
      merged.calendar = {
        ...defaults.calendar,
        ...custom.calendar,
      }
    }

    if (custom.wrapper) {
      merged.wrapper = {
        ...defaults.wrapper,
        ...custom.wrapper,
      }
    }

    return merged as Required<DatePickerClasses>
  }

  private initializeInputs() {
    const { input } = this.config

    if (input.type === 'single') {
      const singleConfig = input.elements as SingleDateInput
      const dateInput = document.getElementById(
        singleConfig.id,
      ) as HTMLInputElement
      if (dateInput) {
        this.registerInput(dateInput, { type: 'single' })
      }
    } else if (input.type === 'two') {
      const rangeConfig = input.elements as DateRangeInput
      const startInput = document.getElementById(
        rangeConfig.start.id,
      ) as HTMLInputElement
      const endInput = document.getElementById(
        rangeConfig.end.id,
      ) as HTMLInputElement

      if (startInput && endInput) {
        this.registerInput(startInput, {
          type: 'start',
          linkedInputId: rangeConfig.end.id,
        })
        this.registerInput(endInput, {
          type: 'end',
          linkedInputId: rangeConfig.start.id,
        })
      }
    } else if (input.type === 'between') {
      const betweenConfig = input.elements as BetweenDateInput
      const dateInput = document.getElementById(
        betweenConfig.id,
      ) as HTMLInputElement
      if (dateInput) {
        this.registerInput(dateInput, { type: 'single' }) // between için 'single' type kullanıyoruz
      }
    }
  }

  private registerInput(
    input: HTMLInputElement,
    config: { type: 'single' | 'start' | 'end'; linkedInputId?: string },
  ) {
    if (!this.registeredInputs.has(input.id)) {
      this.registeredInputs.set(input.id, {
        element: input,
        type: config.type,
        linkedInputId: config.linkedInputId,
      })

      input.addEventListener('click', e => {
        e.stopPropagation()
        this.handleInputClick(input)
      })

      input.addEventListener('focus', () => {
        this.handleInputClick(input)
      })
    }
  }

  private handleInputClick(input: HTMLInputElement) {
    if (this.activeInput === input && this.isDatePickerVisible()) {
      return
    }

    const prevInput = this.activeInput
    this.activeInput = input

    if (input.value) {
      // input.value'dan tarihi parse ederken dd/MM/yyyy formatını dikkate alalım
      const [day, month, year] = input.value.split('/').map(Number)
      const date = new Date(year, month - 1, day) // Ay değerini 1 azaltıyoruz çünkü JS'de aylar 0'dan başlar

      if (!isNaN(date.getTime())) {
        this.currentDate = new Date(date)
        this.selectedDates.set(input.id, new Date(date))
      }
    }

    this.renderCalendar()
    this.renderMonthShortNames()
    this.updateNavigationState()
    this.positionDatePickerUnderInput(input)
    this.showDatePicker()

    if (prevInput) {
      this.updateFocusContainer(prevInput.id, false)
    }
    this.updateFocusContainer(input.id, true)
  }

  private initializeDatePicker() {
    this.renderMonthShortNames()
    this.renderCalendar()
    this.updateNavigationState()
  }

  private showDatePicker() {
    if (this.containerElement && this.classes.wrapper.hidden) {
      this.containerElement.classList.remove(this.classes.wrapper.hidden)
    }
    // Aktif input'un focus container'ını güncelle
    if (this.activeInput) {
      this.updateFocusContainer(this.activeInput.id, true)
    }
  }

  private hideDatePicker() {
    if (this.containerElement && this.classes.wrapper.hidden) {
      this.containerElement.classList.add(this.classes.wrapper.hidden)
    }
    // Aktif input'un focus container'ını güncelle
    if (this.activeInput) {
      this.updateFocusContainer(this.activeInput.id, false)
    }
  }

  private isDatePickerVisible(): boolean {
    return this.containerElement && this.classes.wrapper.hidden
      ? !this.containerElement.classList.contains(this.classes.wrapper.hidden)
      : false
  }

  private positionDatePickerUnderInput(input: HTMLInputElement) {
    if (!this.containerElement) return

    // Get input element dimensions and position
    const inputRect = input.getBoundingClientRect()

    // Get window dimensions
    const windowWidth = window.innerWidth
    const windowHeight = window.innerHeight

    // Get datepicker dimensions
    const datePickerRect = this.containerElement.getBoundingClientRect()

    // Get scroll positions
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const scrollLeft = window.scrollX || document.documentElement.scrollLeft

    // Calculate initial positions
    let top = inputRect.bottom + scrollTop + 8 // 16px padding
    let left = inputRect.left + scrollLeft + -1.5

    // Check if the datepicker would overflow the right edge of the window
    if (left + datePickerRect.width > windowWidth) {
      // Align to the right edge of the input instead
      left = inputRect.right + scrollLeft - datePickerRect.width

      // If still overflowing, align with window right edge with some padding
      if (left < 0) {
        left = windowWidth - datePickerRect.width - 16 // 16px padding from right
      }
    }

    // Check if the datepicker would overflow the bottom of the window
    const bottomOverflow =
      top + datePickerRect.height > windowHeight + scrollTop
    const hasSpaceAbove = inputRect.top - datePickerRect.height - 16 > 0

    if (bottomOverflow && hasSpaceAbove) {
      // Position above the input if there's space
      top = inputRect.top + scrollTop - datePickerRect.height - 16
    } else if (bottomOverflow) {
      // If can't fit above, position it as high as possible while keeping it on screen
      top = windowHeight + scrollTop - datePickerRect.height - 16
    }

    // Ensure left position is never negative
    left = Math.max(8, left) // Minimum 8px from left edge

    // Apply the calculated positions
    this.containerElement.style.position = 'absolute'
    this.containerElement.style.top = `${Math.round(top)}px`
    this.containerElement.style.left = `${Math.round(left)}px`
    this.containerElement.style.zIndex = '1000'
    this.containerElement.style.opacity = '100%'

    // Add a data attribute indicating position (useful for animations/styling)
    this.containerElement.setAttribute(
      'data-position',
      bottomOverflow && hasSpaceAbove ? 'top' : 'bottom',
    )
  }

  private handleWindowResize = () => {
    if (this.activeInput && this.isDatePickerVisible()) {
      this.positionDatePickerUnderInput(this.activeInput)
    }
  }

  private getSelectedLanguage(): LanguageConfig {
    const languageAttr =
      this.containerElement?.getAttribute('data-language') || 'tr'
    return (
      this.config.language.find(lang => lang.language === languageAttr) ||
      this.config.language[0]
    )
  }

  private renderMonthShortNames() {
    if (!this.monthShortNamePointer) return
    const { monthNames } = this.getSelectedLanguage()
    const { month } = this.classes
    const currentMonthIndex = this.currentDate.getMonth()

    this.monthShortNamePointer.innerHTML = `
      <div class="${month.container}">
        <span class="${month.current}">
          ${monthNames[currentMonthIndex]}
        </span>
      </div>`
  }

  private renderCalendar() {
    if (!this.daysContainer) return

    const { dayNames } = this.getSelectedLanguage()
    const { day, calendar } = this.classes

    // Ay için gerekli tarih hesaplamaları
    const firstDayOfMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1,
    )
    const lastDayOfMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0,
    )
    const startingDay = firstDayOfMonth.getDay()

    // Önceki ay günleri hesaplaması
    const prevMonthLastDay = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      0,
    )
    const daysFromPrevMonth = startingDay === 0 ? 6 : startingDay - 1

    // Sonraki ay günleri hesaplaması
    const totalDaysInMonth = lastDayOfMonth.getDate()
    const lastDayOfMonthWeekday = lastDayOfMonth.getDay()
    const daysFromNextMonth =
      lastDayOfMonthWeekday === 0 ? 0 : 7 - lastDayOfMonthWeekday

    let calendarHTML = `<div class="${calendar.grid}">`

    // Gün başlıklarını render et
    dayNames.forEach(dayName => {
      calendarHTML += `<div class="${calendar.dayHeader}">${dayName.substring(0, 2)}</div>`
    })

    // Tarih seçili mi kontrolü
    const isDateSelected = (date: Date): boolean => {
      const strippedDate = this.stripTime(date)

      // Between seçimi için kontrol
      if (this.config.input.type === 'between') {
        if (
          this.betweenStartDate &&
          this.areDatesEqual(strippedDate, this.betweenStartDate)
        ) {
          return true
        }
        if (
          this.betweenEndDate &&
          this.areDatesEqual(strippedDate, this.betweenEndDate)
        ) {
          return true
        }
        return false
      }

      // Normal seçim için kontrol
      for (const selectedDate of this.selectedDates.values()) {
        if (this.areDatesEqual(selectedDate, date)) {
          return true
        }
      }
      return false
    }

    // Gün render fonksiyonu
    const renderDay = (date: Date, isOtherMonth: boolean = false) => {
      const strippedDate = this.stripTime(date)
      const isValid = this.isDateValid(date)
      const isSelected = isDateSelected(date)

      // Between seçimi için özel kontroller
      const isBetweenDate = (() => {
        if (
          this.config.input.type === 'between' &&
          this.betweenStartDate &&
          this.betweenEndDate
        ) {
          return (
            strippedDate > this.stripTime(this.betweenStartDate) &&
            strippedDate < this.stripTime(this.betweenEndDate)
          )
        }
        return false
      })()

      const isBetweenStart =
        this.betweenStartDate &&
        this.areDatesEqual(strippedDate, this.betweenStartDate)

      const isBetweenEnd =
        this.betweenEndDate &&
        this.areDatesEqual(strippedDate, this.betweenEndDate)

      // Normal seçim kontrolleri
      const isCurrentInput =
        this.activeInput &&
        this.areDatesEqual(
          this.selectedDates.get(this.activeInput.id) || null,
          date,
        )

      const isLinkedDate = (() => {
        if (!this.activeInput) return false
        const inputConfig = this.registeredInputs.get(this.activeInput.id)
        if (!inputConfig?.linkedInputId) return false
        const linkedDate = this.selectedDates.get(inputConfig.linkedInputId)
        return linkedDate && this.areDatesEqual(linkedDate, date)
      })()

      // CSS sınıflarını birleştir
      const dayClasses = [
        day.base,
        !isValid ? day.disabled : isOtherMonth ? day.empty : '',
        isSelected ? day.selected : '',
        isCurrentInput ? day.currentInput : '',
        isLinkedDate ? day.linkedHighlight : '',
        isBetweenStart ? day.betweenStart : '',
        isBetweenEnd ? day.betweenEnd : '',
        isBetweenDate ? day.between : '',
      ]
        .filter(Boolean)
        .join(' ')

      return `<div class="${dayClasses}"
              data-date="${date.toISOString()}"
              data-month="${isOtherMonth ? (date < firstDayOfMonth ? 'prev' : 'next') : 'current'}"
              ${isLinkedDate ? 'data-linked="true"' : ''}>
              ${date.getDate()}
          </div>`
    }

    // Önceki ayın günlerini render et
    for (let i = daysFromPrevMonth; i > 0; i--) {
      const prevDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() - 1,
        prevMonthLastDay.getDate() - i + 1,
      )
      calendarHTML += renderDay(prevDate, true)
    }

    // Mevcut ayın günlerini render et
    for (let i = 1; i <= totalDaysInMonth; i++) {
      const currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        i,
      )
      calendarHTML += renderDay(currentDate)
    }

    // Sonraki ayın günlerini render et
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const nextDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth() + 1,
        i,
      )
      calendarHTML += renderDay(nextDate, true)
    }

    calendarHTML += '</div>'
    this.daysContainer.innerHTML = calendarHTML
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  private formatDateBasedOnConfig(
    date: Date,
    type: 'display' | 'backend' = 'display',
  ): string {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString()

    const { monthNames } = this.getSelectedLanguage()

    // Backend formatı
    if (type === 'backend' && this.config.output?.backendFormat) {
      const parts: Record<string, string> = {
        day,
        month,
        year,
      }
      return this.config.output.backendFormat
        .map(part => parts[part])
        .join(this.config.output?.slash || '-')
    }

    // Eğer fullFormat true ise özel formatlama
    if (this.config.output?.fullFormat) {
      const monthName = monthNames[date.getMonth()]
      return `${date.getDate()} ${monthName.slice(0, 3)} ${year}`
    }

    const parts: Record<string, string> = {
      day,
      month,
      year,
    }

    const output = this.config.output || {
      order: ['day', 'month', 'year'],
      slash: '/',
      between: ' - ',
    }

    return output.order.map(part => parts[part]).join(output.slash)
  }

  private addEventListeners() {
    this.prevButton?.addEventListener('click', e => {
      e.stopPropagation()
      this.changeMonth('prev')
    })

    this.nextButton?.addEventListener('click', e => {
      e.stopPropagation()
      this.changeMonth('next')
    })

    this.resetButton?.addEventListener('click', e => {
      e.stopPropagation()
      this.resetToToday()
    })

    this.resetAllButton?.addEventListener('click', e => {
      e.stopPropagation()
      this.resetAllInputs()
    })

    this.daysContainer?.addEventListener('click', e => {
      e.stopPropagation()
      const target = e.target as HTMLElement

      if (target.classList.contains(this.classes.day?.base ?? '')) {
        const dateStr = target.getAttribute('data-date')
        const monthType = target.getAttribute('data-month')

        if (!dateStr || !this.activeInput) return

        const date = new Date(dateStr)
        const selectedDate = this.stripTime(date)
        const inputConfig = this.registeredInputs.get(this.activeInput.id)

        // Önceki/sonraki ay günlerine tıklanınca sadece ay değişimi yap
        if (monthType === 'prev') {
          this.changeMonth('prev')
          return
        } else if (monthType === 'next') {
          this.changeMonth('next')
          return
        }

        // Linked date kontrolü
        const isLinkedDate = (() => {
          if (!this.activeInput) return false

          const currentConfig = this.registeredInputs.get(this.activeInput.id)
          if (!currentConfig?.linkedInputId) return false

          const linkedDate = this.dateValues.get(currentConfig.linkedInputId)
          return linkedDate && this.areDatesEqual(linkedDate, date)
        })()

        // Eğer linked date'e tıklandıysa, bağlantılı input'a geç
        if (isLinkedDate && this.activeInput) {
          const currentConfig = this.registeredInputs.get(this.activeInput.id)
          if (currentConfig?.linkedInputId) {
            const linkedInput = document.getElementById(
              currentConfig.linkedInputId,
            ) as HTMLInputElement
            if (linkedInput) {
              this.handleInputClick(linkedInput)
              return
            }
          }
        }

        // Eğer disabled bir güne tıklandıysa ve bu gün linked date ise
        // yine diğer input'a geçiş yap
        if (target.classList.contains(this.classes.day?.disabled ?? '')) {
          const currentConfig = this.registeredInputs.get(this.activeInput.id)
          if (currentConfig?.linkedInputId) {
            const linkedDate = this.dateValues.get(currentConfig.linkedInputId)
            if (linkedDate && this.areDatesEqual(linkedDate, date)) {
              const linkedInput = document.getElementById(
                currentConfig.linkedInputId,
              ) as HTMLInputElement
              if (linkedInput) {
                this.handleInputClick(linkedInput)
                return
              }
            }
          }
          return // Disabled ise ve linked date değilse hiçbir şey yapma
        }

        // Tarih seçimi öncesi validasyon
        if (inputConfig) {
          if (inputConfig.type === 'start' && inputConfig.linkedInputId) {
            const endDate = this.dateValues.get(inputConfig.linkedInputId)
            if (endDate && this.stripTime(endDate) <= selectedDate) {
              return
            }
          } else if (inputConfig.type === 'end' && inputConfig.linkedInputId) {
            const startDate = this.dateValues.get(inputConfig.linkedInputId)
            if (startDate && this.stripTime(startDate) >= selectedDate) {
              return
            }
          }
        }

        // Seçilen tarihi güncelle
        if (this.activeInput) {
          this.selectedDates.set(this.activeInput.id, date)
        }
        this.currentDate = new Date(date)

        // Sadece mevcut ayın günleri için tarih seçimini işle
        if (monthType === 'current') {
          this.selectDate(date)
        } else {
          this.renderCalendar()
          this.renderMonthShortNames()
          this.updateNavigationState()
        }
      }
    })

    this.containerElement?.addEventListener('click', e => {
      e.stopPropagation()
    })

    document.addEventListener('click', e => {
      const target = e.target as HTMLElement
      const isDateInput = Array.from(this.registeredInputs.values()).some(
        input => input.element === target,
      )
      const isOutsideClick =
        this.containerElement &&
        !this.containerElement.contains(target) &&
        !isDateInput

      if (isOutsideClick && this.isDatePickerVisible()) {
        if (this.activeInput && this.config.input.type === 'between') {
          if (this.betweenStartDate && !this.betweenEndDate) {
            // Tek tarih seçilip kapatılınca tüm değerleri temizle
            this.resetAllInputs()
            this.activeInput.removeAttribute('data-start')
          } else if (this.betweenStartDate && this.betweenEndDate) {
            const output = this.config.output || {
              order: ['day', 'month', 'year'],
              slash: '-',
              between: ' & ',
            }
            this.activeInput.value = `${this.formatDateBasedOnConfig(this.betweenStartDate)}${output.between}${this.formatDateBasedOnConfig(this.betweenEndDate)}`
          }
        }

        this.hideDatePicker()
        this.activeInput = null
      }
    })

    if (this.closeButton) {
      this.closeButton.addEventListener('click', e => {
        e.stopPropagation()
        this.hideDatePicker()
        this.activeInput = null
      })
    }
  }

  public safeChangeMonth(direction: 'next' | 'prev') {
    const { minDate, maxDate } = this.config
    const currentMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1, // Ayın ilk günü
    )

    // Ay hesaplamasını düzelt
    const targetMonth =
      direction === 'prev'
        ? new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
        : new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)

    // Minimum tarih kontrolü
    if (direction === 'prev' && minDate) {
      const strippedMinDate = this.stripTime(minDate)
      const lastDayOfTargetMonth = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0,
      )

      if (lastDayOfTargetMonth < strippedMinDate) {
        return false // Önceki aya gitmeye izin verme
      }
    }

    // Maximum tarih kontrolü
    if (direction === 'next' && maxDate) {
      const strippedMaxDate = this.stripTime(maxDate)
      const lastDayOfTargetMonth = new Date(
        targetMonth.getFullYear(),
        targetMonth.getMonth() + 1,
        0,
      )

      if (lastDayOfTargetMonth > strippedMaxDate) {
        return false // Sonraki aya gitmeye izin verme
      }
    }

    // Güvenli değişim
    this.changeMonth(direction)
    return true
  }

  private updateNavigationState() {
    const { minDate, maxDate } = this.config
    const currentMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
    )

    if (this.prevButton && minDate) {
      const isDisabled = currentMonth <= minDate
      if (this.classes.month.buttons?.prev?.disabled) {
        this.prevButton.classList.toggle(
          this.classes.month.buttons.prev.disabled,
          isDisabled,
        )
      }
      ;(this.prevButton as HTMLButtonElement).disabled = isDisabled
    }

    if (this.nextButton && maxDate) {
      const isDisabled = currentMonth >= maxDate
      if (this.classes.month.buttons?.next?.disabled) {
        this.nextButton.classList.toggle(
          this.classes.month.buttons.next.disabled,
          isDisabled,
        )
      }
      ;(this.nextButton as HTMLButtonElement).disabled = isDisabled
    }
  }

  private stripTime(date: Date): Date {
    const newDate = new Date(date)
    newDate.setHours(0, 0, 0, 0)
    return newDate
  }

  private isDateValid(date: Date): boolean {
    const strippedDate = this.stripTime(date)
    const { minDate, maxDate } = this.config

    if (minDate && strippedDate < minDate) return false
    if (maxDate && strippedDate > maxDate) return false

    // Range modu için özel validasyon
    if (this.config.input.type === 'two' && this.activeInput) {
      const inputConfig = this.registeredInputs.get(this.activeInput.id)

      if (inputConfig?.type === 'start' && inputConfig.linkedInputId) {
        // Gidiş tarihi için kontrol - seçili bir dönüş tarihi varsa ondan sonrası disabled olmalı
        const endDate = this.dateValues.get(inputConfig.linkedInputId)
        if (endDate && strippedDate >= this.stripTime(endDate)) {
          return false
        }
      } else if (inputConfig?.type === 'end' && inputConfig.linkedInputId) {
        // Dönüş tarihi için kontrol - seçili bir gidiş tarihi varsa ondan öncesi disabled olmalı
        const startDate = this.dateValues.get(inputConfig.linkedInputId)
        if (startDate && strippedDate <= this.stripTime(startDate)) {
          return false
        }
      }
    }

    // Between modu için özel validasyon
    if (this.config.input.type === 'between') {
      if (this.betweenEndDate && strippedDate > this.betweenEndDate) {
        return false
      }
    }

    return true
  }

  public changeMonth(direction: 'next' | 'prev') {
    const newMonth =
      direction === 'next'
        ? this.currentDate.getMonth() + 1
        : this.currentDate.getMonth() - 1

    this.currentDate.setMonth(newMonth)
    this.renderMonthShortNames()
    this.renderCalendar()
    this.updateNavigationState()
    this.positionDatePickerUnderInput(this.activeInput!)
  }

  private areDatesEqual(date1: Date | null, date2: Date): boolean {
    if (!date1) return false
    const d1 = this.stripTime(date1)
    const d2 = this.stripTime(date2)
    return d1.getTime() === d2.getTime()
  }

  private selectDate(date: Date) {
    if (!this.activeInput || !this.isDatePickerVisible()) return

    const inputConfig = this.registeredInputs.get(this.activeInput.id)
    if (!inputConfig) return

    const shouldAutoClose = this.config.autoClose ?? true
    const shouldAutoSwitch = this.config.autoSwitchInput ?? true
    const selectedDate = this.stripTime(date)

    // Input type'a göre data attribute'ları ekleyelim
    if (this.config.input.type === 'between') {
      if (!this.betweenStartDate) {
        this.activeInput.setAttribute(
          'data-start',
          this.formatDateBasedOnConfig(date, 'backend'),
        )
      } else {
        this.activeInput.setAttribute(
          'data-end',
          this.formatDateBasedOnConfig(date, 'backend'),
        )
      }
    } else if (this.config.input.type === 'single') {
      // Single input için data-selected attribute'u
      this.activeInput.setAttribute(
        'data-selected',
        this.formatDateBasedOnConfig(date, 'backend'),
      )
    } else if (this.config.input.type === 'two') {
      // İki input için start ve end attribute'ları
      const inputType = inputConfig.type
      if (inputType === 'start') {
        this.activeInput.setAttribute(
          'data-start',
          this.formatDateBasedOnConfig(date, 'backend'),
        )
      } else if (inputType === 'end') {
        this.activeInput.setAttribute(
          'data-end',
          this.formatDateBasedOnConfig(date, 'backend'),
        )
      }
    }

    // Between tipi için özel tarih seçim mantığı
    if (this.config.input.type === 'between') {
      // Seçilen tarih zaten seçili olan başlangıç veya bitiş tarihiyse, date picker'ı resetle
      if (
        (this.betweenStartDate &&
          this.areDatesEqual(selectedDate, this.betweenStartDate)) ||
        (this.betweenEndDate &&
          this.areDatesEqual(selectedDate, this.betweenEndDate))
      ) {
        // Tüm seçimleri temizle
        this.betweenStartDate = null
        this.betweenEndDate = null
        this.selectedDates.clear()
        this.dateValues.clear()
        this.activeInput.value = ''

        // Yeni seçim olarak seçilen tarihi ata
        this.betweenStartDate = selectedDate
        this.selectedDates.set(`${this.activeInput.id}-start`, selectedDate)
        this.dateValues.set(`${this.activeInput.id}-start`, selectedDate)
        this.activeInput.value = this.formatDateBasedOnConfig(selectedDate)

        this.renderCalendar()
        return
      }

      // Hiç tarih seçili değilse (ilk seçim)
      if (!this.betweenStartDate && !this.betweenEndDate) {
        this.betweenStartDate = selectedDate
        this.isBetweenSelectionActive = true

        this.activeInput.value = this.formatDateBasedOnConfig(selectedDate)
        this.selectedDates.set(`${this.activeInput.id}-start`, selectedDate)
        this.dateValues.set(`${this.activeInput.id}-start`, selectedDate)

        this.renderCalendar()
        return
      }

      // Sadece başlangıç tarihi seçili ve yeni tarih seçiliyorsa
      if (this.betweenStartDate && !this.betweenEndDate) {
        if (selectedDate <= this.betweenStartDate) {
          // Seçilen tarih başlangıç tarihinden önce veya eşitse, yeni başlangıç tarihi yap
          this.betweenStartDate = selectedDate
          this.selectedDates.set(`${this.activeInput.id}-start`, selectedDate)
          this.dateValues.set(`${this.activeInput.id}-start`, selectedDate)
          this.activeInput.value = this.formatDateBasedOnConfig(selectedDate)
        } else {
          // Seçilen tarih başlangıçtan sonraysa, bitiş tarihi yap
          this.betweenEndDate = selectedDate
          this.selectedDates.set(`${this.activeInput.id}-end`, selectedDate)
          this.dateValues.set(`${this.activeInput.id}-end`, selectedDate)

          // Between separator'ı kullanarak iki tarihi birleştir
          const output = this.config.output || {
            order: ['day', 'month', 'year'],
            slash: '/',
            between: ' - ',
          }

          this.activeInput.value = `${this.formatDateBasedOnConfig(this.betweenStartDate)}${output.between}${this.formatDateBasedOnConfig(selectedDate)}`

          if (shouldAutoClose) {
            this.hideDatePicker()
            this.activeInput = null
          }
        }
        this.renderCalendar()
        return
      }

      // İki tarih de seçiliyse, yeni seçim başlatılır
      if (this.betweenStartDate && this.betweenEndDate) {
        // Tüm seçimleri temizle ve yeni başlangıç tarihi olarak seç
        this.betweenStartDate = selectedDate
        this.betweenEndDate = null
        this.selectedDates.clear()
        this.dateValues.clear()

        this.selectedDates.set(`${this.activeInput.id}-start`, selectedDate)
        this.dateValues.set(`${this.activeInput.id}-start`, selectedDate)
        this.activeInput.value = this.formatDateBasedOnConfig(selectedDate)

        this.renderCalendar()
        return
      }
    }

    // Range tipi için özel tarih seçim mantığı
    if (this.config.input.type === 'two') {
      // Tarihi seç ve input'u güncelle
      this.selectedDates.set(this.activeInput.id, new Date(selectedDate))
      this.dateValues.set(this.activeInput.id, new Date(selectedDate))
      this.activeInput.value = this.formatDateBasedOnConfig(selectedDate)

      // Diğer input'a geçiş kontrolü
      if (shouldAutoSwitch && inputConfig.linkedInputId) {
        const linkedInput = document.getElementById(
          inputConfig.linkedInputId,
        ) as HTMLInputElement
        const linkedDate = this.selectedDates.get(inputConfig.linkedInputId)

        if (linkedInput && !linkedDate) {
          // Date picker'ı kapatmadan diğer input'a geç
          this.handleInputClick(linkedInput)
          this.updateFocusContainer(this.activeInput.id, false)
          this.updateFocusContainer(linkedInput.id, true)
          return
        }
      }

      // İki tarih de seçiliyse ve autoClose true ise kapat
      if (shouldAutoClose) {
        this.hideDatePicker()
        this.activeInput = null
      }

      this.renderCalendar()
      return
    }

    // Normal tarih seçimi işlemleri (single mod)
    if (this.isDateValid(date)) {
      // Seçilen tarihi kaydet
      this.selectedDates.set(this.activeInput.id, new Date(selectedDate))
      this.activeInput.value = this.formatDateBasedOnConfig(selectedDate)
      this.dateValues.set(this.activeInput.id, new Date(selectedDate))

      // Bağlantılı tarihleri kontrol et ve gerekirse temizle
      if (inputConfig.type === 'start' && inputConfig.linkedInputId) {
        const endInput = document.getElementById(
          inputConfig.linkedInputId,
        ) as HTMLInputElement
        const endDate = this.dateValues.get(inputConfig.linkedInputId)
        if (endDate && this.stripTime(endDate) < selectedDate) {
          endInput.value = ''
          this.dateValues.delete(inputConfig.linkedInputId)
          this.selectedDates.delete(inputConfig.linkedInputId)
        }
      } else if (inputConfig.type === 'end' && inputConfig.linkedInputId) {
        const startInput = document.getElementById(
          inputConfig.linkedInputId,
        ) as HTMLInputElement
        const startDate = this.dateValues.get(inputConfig.linkedInputId)
        if (startDate && this.stripTime(startDate) > selectedDate) {
          startInput.value = ''
          this.dateValues.delete(inputConfig.linkedInputId)
          this.selectedDates.delete(inputConfig.linkedInputId)
        }
      }

      this.renderCalendar()

      // Single mod için autoClose kontrolü
      if (shouldAutoClose) {
        this.hideDatePicker()
        this.activeInput = null
      }
    }
  }

  public resetInput(inputId: string) {
    const inputConfig = this.registeredInputs.get(inputId)
    if (inputConfig) {
      const input = inputConfig.element
      input.value = ''

      // Input type'a göre attribute'ları temizle
      if (this.config.input.type === 'between') {
        input.removeAttribute('data-start')
        input.removeAttribute('data-end')
      } else if (this.config.input.type === 'single') {
        input.removeAttribute('data-selected')
      } else if (this.config.input.type === 'two') {
        if (inputConfig.type === 'start') {
          input.removeAttribute('data-start')
        } else if (inputConfig.type === 'end') {
          input.removeAttribute('data-end')
        }
      }

      this.selectedDates.delete(inputId)
      this.renderCalendar()
    }
  }

  public resetToToday() {
    const today = this.stripTime(new Date())

    // Between modu için özel resetleme mantığı
    if (this.config.input.type === 'between') {
      // Her şeyi temizle ve bugünü başlangıç tarihi yap
      this.betweenStartDate = today
      this.betweenEndDate = null
      this.selectedDates.clear()
      this.dateValues.clear()

      // Yeni başlangıç tarihini kaydet
      this.selectedDates.set(`${this.activeInput?.id}-start`, today)
      this.dateValues.set(`${this.activeInput?.id}-start`, today)

      // Input değerini güncelle - yeni formatlama sistemi ile
      if (this.activeInput) {
        this.activeInput.value = this.formatDateBasedOnConfig(today)
      }

      // Calendar'ı bugünün olduğu aya getir
      this.currentDate = new Date(today)
      this.selectedDate = today

      this.renderMonthShortNames()
      this.renderCalendar()
      this.updateNavigationState()
      return
    }

    // Normal mod için mevcut mantık devam eder
    if (this.activeInput) {
      const inputConfig = this.registeredInputs.get(this.activeInput.id)

      if (inputConfig?.type === 'end' && inputConfig.linkedInputId) {
        // Dönüş tarihi inputu aktifken
        const startInput = document.getElementById(
          inputConfig.linkedInputId,
        ) as HTMLInputElement
        const startDate = this.selectedDates.get(inputConfig.linkedInputId)

        // Eğer gidiş tarihi seçiliyse, gidiş inputuna geç
        if (startDate && startInput) {
          this.handleInputClick(startInput)
          return
        }
      }

      // Gidiş tarihi seçili değilse veya gidiş inputu aktifse bugüne dön
      this.currentDate = new Date(today)
      this.selectedDate = today
      this.selectedDates.set(this.activeInput.id, new Date(today))
      this.dateValues.set(this.activeInput.id, new Date(today))
      // Yeni formatlama sistemi ile bugünün tarihini yazdır
      this.activeInput.value = this.formatDateBasedOnConfig(today)
    } else {
      this.currentDate = new Date(today)
      this.selectedDate = today
    }

    this.renderMonthShortNames()
    this.renderCalendar()
    this.updateNavigationState()
  }

  private resetAllInputs() {
    this.registeredInputs.forEach(config => {
      const input = config.element
      input.value = ''

      // Input type'a göre attribute'ları temizle
      if (this.config.input.type === 'between') {
        input.removeAttribute('data-start')
        input.removeAttribute('data-end')
      } else if (this.config.input.type === 'single') {
        input.removeAttribute('data-selected')
      } else if (this.config.input.type === 'two') {
        input.removeAttribute('data-start')
        input.removeAttribute('data-end')
      }
    })

    this.selectedDates.clear()
    this.dateValues.clear()
    this.currentDate = new Date()
    this.selectedDate = null
    this.betweenStartDate = null
    this.betweenEndDate = null
    this.isBetweenSelectionActive = false

    this.renderMonthShortNames()
    this.renderCalendar()
    this.updateNavigationState()
  }

  public destroy() {
    window.removeEventListener('resize', this.handleWindowResize)
  }
}

export { DatePicker }
export type { DatePickerConfig, LanguageConfig }
