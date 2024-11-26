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
  },
} as const

interface LanguageConfig {
  language: string
  monthNames: string[]
  dayNames: string[]
}

type DatePickerInputType = 'single' | 'range'

interface SingleDateInput {
  id: string
}

interface DateRangeInput {
  start: {
    id: string
  }
  end: {
    id: string
  }
}

interface DatePickerInputConfig {
  type: DatePickerInputType
  config: SingleDateInput | DateRangeInput
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
  private dateValues: Map<string, Date> = new Map()

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
    }

    window.addEventListener('resize', this.handleWindowResize)

    this.hideDatePicker()
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

    this.activeInput = input

    if (input.value) {
      const date = new Date(input.value)
      if (!isNaN(date.getTime())) {
        this.currentDate = new Date(date)
        this.selectedDate = new Date(date)
      }
    } else {
      this.currentDate = new Date()
      this.selectedDate = null
    }

    this.renderCalendar()
    this.renderMonthShortNames()
    this.updateNavigationState()
    this.positionDatePickerUnderInput(input)
    this.showDatePicker()
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
  }

  private hideDatePicker() {
    if (this.containerElement && this.classes.wrapper.hidden) {
      this.containerElement.classList.add(this.classes.wrapper.hidden)
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
    let left = inputRect.left + scrollLeft + -8

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
    left = Math.max(16, left) // Minimum 16px from left edge

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

    let calendarHTML = `<div class="${calendar.grid}">`

    dayNames.forEach(dayName => {
      calendarHTML += `<div class="${calendar.dayHeader}">${dayName.substring(0, 2)}</div>`
    })

    for (let i = 0; i < startingDay; i++) {
      calendarHTML += `<div class="${day.base} ${day.empty}"></div>`
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        i,
      )
      const isValid = this.isDateValid(currentDate)
      const isSelected = this.areDatesEqual(this.selectedDate, currentDate)

      const dayClasses = [
        day.base,
        !isValid ? day.disabled : '',
        isSelected ? day.selected : '',
      ]
        .filter(Boolean)
        .join(' ')

      calendarHTML += `
        <div class="${dayClasses}" data-date="${currentDate.toISOString()}">
          ${i}
        </div>`
    }

    calendarHTML += '</div>'
    this.daysContainer.innerHTML = calendarHTML
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
      if (
        target.classList.contains(this.classes.day?.base ?? '') &&
        !target.classList.contains(this.classes.day?.empty ?? '') &&
        !target.classList.contains(this.classes.day?.disabled ?? '')
      ) {
        const dateStr = target.getAttribute('data-date')
        if (dateStr) {
          const date = new Date(dateStr)
          this.selectDate(date)
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

      if (
        !isDateInput &&
        this.containerElement &&
        !this.containerElement.contains(target)
      ) {
        this.hideDatePicker()
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

    if (this.activeInput) {
      const inputConfig = this.registeredInputs.get(this.activeInput.id)
      if (inputConfig?.type === 'end' && inputConfig.linkedInputId) {
        const startDate = this.dateValues.get(inputConfig.linkedInputId)
        if (startDate && strippedDate < this.stripTime(startDate)) return false
      } else if (inputConfig?.type === 'start' && inputConfig.linkedInputId) {
        const endDate = this.dateValues.get(inputConfig.linkedInputId)
        if (endDate && strippedDate > this.stripTime(endDate)) return false
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
    if (this.isDateValid(date)) {
      this.selectedDate = date
      if (this.activeInput) {
        this.activeInput.value = date.toLocaleDateString()
        this.dateValues.set(this.activeInput.id, new Date(date))

        const inputConfig = this.registeredInputs.get(this.activeInput.id)
        if (inputConfig?.type === 'start' && inputConfig.linkedInputId) {
          const endInput = document.getElementById(
            inputConfig.linkedInputId,
          ) as HTMLInputElement
          const endDate = this.dateValues.get(inputConfig.linkedInputId)

          if (endDate && endDate < date) {
            endInput.value = ''
            this.dateValues.delete(inputConfig.linkedInputId)
          }
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

  public resetToToday() {
    const today = this.stripTime(new Date())
    this.currentDate = new Date(today)
    this.selectedDate = today
    if (this.activeInput) {
      this.activeInput.value = today.toLocaleDateString()
      this.dateValues.set(this.activeInput.id, new Date(today))
    }
    this.renderMonthShortNames()
    this.renderCalendar()
    this.updateNavigationState()
  }

  public resetAllInputs() {
    this.registeredInputs.forEach(config => {
      config.element.value = ''
    })

    this.dateValues.clear()
    this.selectedDate = null
    this.currentDate = new Date()
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
