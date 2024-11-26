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

type DatePickerInputType = 'single' | 'range' | 'between'

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
  config: SingleDateInput | DateRangeInput | BetweenDateInput
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
  pointer?: {
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

interface DatePickerConfig {
  containers: {
    container: string
    monthContainer: string
    daysContainer: string
    pointer: {
      prev: string
      next: string
    }
    reset?: string
    resetAll?: string
  }
  input: DatePickerInputConfig
  classes?: DatePickerClasses
  language: LanguageConfig[]
  minDate?: Date
  maxDate?: Date
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
  // Yeni eklenecek state'ler
  private betweenStartDate: Date | null = null
  private betweenEndDate: Date | null = null
  private isBetweenSelectionActive = false

  // this.selectedDates.set(this.activeInput.id, this.betweenStartDate)
  // this.dateValues.set(this.activeInput.id, date)

  constructor(config: DatePickerConfig) {
    this.config = config
    this.classes = this.mergeClasses(DEFAULT_CLASSES, config.classes || {})

    // Reset hours, minutes, seconds, and milliseconds for consistent date comparison
    this.currentDate = this.stripTime(new Date())
    this.selectedDate = this.stripTime(new Date())

    // Also strip time from min and max dates
    if (this.config.minDate) {
      this.config.minDate = this.stripTime(this.config.minDate)
    }
    if (this.config.maxDate) {
      this.config.maxDate = this.stripTime(this.config.maxDate)
    }

    this.monthShortNamePointer = document.getElementById(
      config.containers.monthContainer,
    )
    this.daysContainer = document.getElementById(
      config.containers.daysContainer,
    )
    this.containerElement = document.getElementById(config.containers.container)
    this.prevButton = document.getElementById(config.containers.pointer.prev)
    this.nextButton = document.getElementById(config.containers.pointer.next)

    if (config.containers.reset) {
      this.resetButton = document.getElementById(config.containers.reset)
    }

    if (config.containers.resetAll) {
      this.resetAllButton = document.getElementById(config.containers.resetAll)
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

  private initializeFocusContainers() {
    const { input } = this.config

    if (input.type === 'single') {
      const singleConfig = input.config as SingleDateInput
      if (singleConfig.focusContainer) {
        const container = document.getElementById(singleConfig.focusContainer)
        if (container) {
          this.focusContainers.set(singleConfig.id, container)
        }
      }
    } else if (input.type === 'range') {
      const rangeConfig = input.config as DateRangeInput

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
        pointer: {
          prev: {
            ...defaults.month?.pointer?.prev,
            ...custom.month?.pointer?.prev,
          },
          next: {
            ...defaults.month?.pointer?.next,
            ...custom.month?.pointer?.next,
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
      const singleConfig = input.config as SingleDateInput
      const dateInput = document.getElementById(
        singleConfig.id,
      ) as HTMLInputElement
      if (dateInput) {
        this.registerInput(dateInput, { type: 'single' })
      }
    } else if (input.type === 'range') {
      const rangeConfig = input.config as DateRangeInput
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
      const betweenConfig = input.config as BetweenDateInput
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

    // Range modu için özel kontrol
    if (this.config.input.type === 'range') {
      const inputConfig = this.registeredInputs.get(input.id)
      if (inputConfig?.linkedInputId) {
        const linkedInput = document.getElementById(
          inputConfig.linkedInputId,
        ) as HTMLInputElement

        // Tarihleri kontrol et ve gerekirse temizle
        if (inputConfig.type === 'start') {
          const endDate = this.dateValues.get(linkedInput?.id)
          if (endDate && input.value) {
            const startDate = new Date(input.value)
            if (this.stripTime(endDate) <= this.stripTime(startDate)) {
              linkedInput.value = ''
              this.dateValues.delete(linkedInput.id)
              this.selectedDates.delete(linkedInput.id)
            }
          }
        } else if (inputConfig.type === 'end') {
          const startDate = this.dateValues.get(linkedInput?.id)
          if (startDate && input.value) {
            const endDate = new Date(input.value)
            if (this.stripTime(endDate) <= this.stripTime(startDate)) {
              input.value = ''
              this.dateValues.delete(input.id)
              this.selectedDates.delete(input.id)
            }
          }
        }
      }
    }

    if (input.value) {
      const date = new Date(input.value)
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

    // Önceki input'un focus container'ını güncelle
    if (prevInput) {
      this.updateFocusContainer(prevInput.id, false)
    }

    // Yeni input'un focus container'ını güncelle
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
          this.activeInput &&
          this.config.input.type === 'between' &&
          this.betweenStartDate
        ) {
          if (this.betweenEndDate) {
            return (
              strippedDate > this.stripTime(this.betweenStartDate) &&
              strippedDate < this.stripTime(this.betweenEndDate)
            )
          }
          return strippedDate > this.stripTime(this.betweenStartDate)
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

        // Handle month transition if clicking on prev/next month days
        if (monthType === 'prev') {
          this.changeMonth('prev')
        } else if (monthType === 'next') {
          this.changeMonth('next')
        }

        // Update selected date and current date
        if (this.activeInput) {
          this.selectedDates.set(this.activeInput.id, date)
        }
        this.currentDate = new Date(date)

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
          // Between modunda sadece bir tarih seçiliyse her şeyi resetle
          if (
            (this.betweenStartDate && !this.betweenEndDate) ||
            (!this.betweenStartDate && this.betweenEndDate)
          ) {
            this.resetAllInputs()
          } else if (this.betweenStartDate && this.betweenEndDate) {
            // İki tarih de seçiliyse mevcut değerleri koru
            this.activeInput.value = `${this.formatDate(this.betweenStartDate)} & ${this.formatDate(this.betweenEndDate)}`
          }
        }

        this.hideDatePicker()
        this.activeInput = null
      }
    })
  }

  private updateNavigationState() {
    const { minDate, maxDate } = this.config
    const currentMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
    )

    if (this.prevButton && minDate) {
      const isDisabled = currentMonth <= minDate
      if (this.classes.month.pointer?.prev?.disabled) {
        this.prevButton.classList.toggle(
          this.classes.month.pointer.prev.disabled,
          isDisabled,
        )
      }
      ;(this.prevButton as HTMLButtonElement).disabled = isDisabled
    }

    if (this.nextButton && maxDate) {
      const isDisabled = currentMonth >= maxDate
      if (this.classes.month.pointer?.next?.disabled) {
        this.nextButton.classList.toggle(
          this.classes.month.pointer.next.disabled,
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

    // Between seçimi için özel validasyon
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
  }

  private selectDate(date: Date) {
    if (!this.activeInput) return

    const inputConfig = this.registeredInputs.get(this.activeInput.id)
    if (!inputConfig) return

    // Between tipi için özel tarih seçim mantığı
    if (this.config.input.type === 'between') {
      const selectedDate = this.stripTime(date)

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
        this.activeInput.value = this.formatDate(selectedDate)

        this.renderCalendar()
        return
      }

      // Hiç tarih seçili değilse (ilk seçim)
      if (!this.betweenStartDate && !this.betweenEndDate) {
        this.betweenStartDate = selectedDate
        this.isBetweenSelectionActive = true

        this.activeInput.value = this.formatDate(selectedDate)
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
          this.activeInput.value = this.formatDate(selectedDate)
        } else {
          // Seçilen tarih başlangıçtan sonraysa, bitiş tarihi yap
          this.betweenEndDate = selectedDate
          this.selectedDates.set(`${this.activeInput.id}-end`, selectedDate)
          this.dateValues.set(`${this.activeInput.id}-end`, selectedDate)
          this.activeInput.value = `${this.formatDate(this.betweenStartDate)} & ${this.formatDate(selectedDate)}`

          // İki tarih de seçili olduğunda date picker'ı kapat
          this.hideDatePicker()
          this.activeInput = null
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
        this.activeInput.value = this.formatDate(selectedDate)

        this.renderCalendar()
        return
      }
    }

    if (this.config.input.type === 'range') {
      const selectedDate = this.stripTime(date)

      // Tarihi seç ve input'u güncelle
      this.selectedDates.set(this.activeInput.id, new Date(selectedDate))
      this.dateValues.set(this.activeInput.id, new Date(selectedDate))
      this.activeInput.value = this.formatDate(selectedDate)

      // Diğer input'a geçiş kontrolü
      if (inputConfig.linkedInputId) {
        const linkedInput = document.getElementById(
          inputConfig.linkedInputId,
        ) as HTMLInputElement
        const linkedDate = this.selectedDates.get(inputConfig.linkedInputId)

        if (linkedInput && !linkedDate) {
          // Date picker'ı kapatmadan diğer input'a geç
          this.handleInputClick(linkedInput)

          // Orijinal input'un focus container'ını güncelle
          this.updateFocusContainer(this.activeInput.id, false)

          // Yeni input'un focus container'ını güncelle
          this.updateFocusContainer(linkedInput.id, true)

          return
        }
      }

      // Eğer bağlantılı input yoksa veya zaten seçiliyse date picker'ı kapat
      this.hideDatePicker()
      this.activeInput = null
      return
    }

    // Normal tarih seçimi işlemleri
    const selectedDate = this.stripTime(date)

    // Bağlantılı tarihler için validasyon kontrolleri
    if (inputConfig) {
      if (inputConfig.type === 'start' && inputConfig.linkedInputId) {
        const endDate = this.dateValues.get(inputConfig.linkedInputId)
        if (endDate && this.stripTime(endDate) < selectedDate) {
          console.warn('Gidiş tarihi dönüş tarihinden sonra olamaz')
          return
        }
      } else if (inputConfig.type === 'end' && inputConfig.linkedInputId) {
        const startDate = this.dateValues.get(inputConfig.linkedInputId)
        if (startDate && this.stripTime(startDate) > selectedDate) {
          console.warn('Dönüş tarihi gidiş tarihinden önce olamaz')
          return
        }
      }
    }

    if (this.isDateValid(date)) {
      // Seçilen tarihi kaydet
      this.selectedDates.set(this.activeInput.id, new Date(selectedDate))
      this.activeInput.value = selectedDate.toLocaleDateString()
      this.dateValues.set(this.activeInput.id, new Date(selectedDate))

      // Bağlantılı tarihleri kontrol et ve gerekirse temizle
      if (inputConfig?.type === 'start' && inputConfig.linkedInputId) {
        const endInput = document.getElementById(
          inputConfig.linkedInputId,
        ) as HTMLInputElement
        const endDate = this.dateValues.get(inputConfig.linkedInputId)
        if (endDate && this.stripTime(endDate) < selectedDate) {
          endInput.value = ''
          this.dateValues.delete(inputConfig.linkedInputId)
          this.selectedDates.delete(inputConfig.linkedInputId)
        }
      } else if (inputConfig?.type === 'end' && inputConfig.linkedInputId) {
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
      this.hideDatePicker()
    }
  }

  private areDatesEqual(date1: Date | null, date2: Date): boolean {
    if (!date1) return false
    const d1 = this.stripTime(date1)
    const d2 = this.stripTime(date2)
    return d1.getTime() === d2.getTime()
  }

  public resetInput(inputId: string) {
    const inputConfig = this.registeredInputs.get(inputId)
    if (inputConfig) {
      inputConfig.element.value = ''
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

      // Input değerini güncelle
      if (this.activeInput) {
        this.activeInput.value = this.formatDate(today)
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
      this.activeInput.value = today.toLocaleDateString()
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
      config.element.value = ''
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
