interface LanguageConfig {
  language: string;
  monthNames: string[];
  dayNames: string[];
}

interface DatePickerConfig {
  containers: {
    container: string;
    monthContainer: string;
    daysContainer: string;
    pointer: {
      prev: string;
      next: string;
    };
    reset?: string;
  };
  classes: {
    day: {
      base: string;
      disabled: string;
      selected: string;
      empty: string;
    };
    month: {
      container: string;
      current: string;
      pointer: {
        prev: {
          base: string;
          disabled: string;
        };
        next: {
          base: string;
          disabled: string;
        };
      };
    };
    calendar: {
      grid: string;
      dayHeader: string;
    };
    wrapper: {
      base: string;
      hidden: string;
    };
  };
  language: LanguageConfig[];
  minDate?: Date;
  maxDate?: Date;
}

class DatePicker {
  private config: DatePickerConfig;
  private currentDate: Date;
  private selectedDate: Date | null = null;
  private monthShortNamePointer: HTMLElement | null;
  private daysContainer: HTMLElement | null;
  private containerElement: HTMLElement | null;
  private activeInput: HTMLInputElement | null = null;
  private prevButton: HTMLElement | null = null;
  private nextButton: HTMLElement | null = null;
  private resetButton: HTMLElement | null = null;
  private registeredInputs: Set<HTMLInputElement> = new Set();

  constructor(config: DatePickerConfig) {
    this.config = config;
    this.currentDate = new Date();
    this.selectedDate = new Date();

    this.monthShortNamePointer = document.getElementById(
      config.containers.monthContainer,
    );
    this.daysContainer = document.getElementById(
      config.containers.daysContainer,
    );
    this.containerElement = document.getElementById(
      config.containers.container,
    );
    this.prevButton = document.getElementById(config.containers.pointer.prev);
    this.nextButton = document.getElementById(config.containers.pointer.next);

    if (config.containers.reset) {
      this.resetButton = document.getElementById(config.containers.reset);
    }

    if (
      !this.monthShortNamePointer ||
      !this.daysContainer ||
      !this.containerElement
    ) {
      console.warn("One or more container elements not found.");
    } else {
      this.initializeDatePicker();
      this.addEventListeners();
    }

    // Hide date picker initially
    this.hideDatePicker();
  }

  // Register input elements that will use this date picker
  public registerInput(input: HTMLInputElement) {
    if (!this.registeredInputs.has(input)) {
      this.registeredInputs.add(input);

      // Add click listener to the input
      input.addEventListener("click", (e) => {
        e.stopPropagation();
        this.handleInputClick(input);
      });

      // Add focus listener to the input
      input.addEventListener("focus", () => {
        this.handleInputClick(input);
      });
    }
  }

  private handleInputClick(input: HTMLInputElement) {
    // If clicking the same input that's already active, do nothing
    if (this.activeInput === input && this.isDatePickerVisible()) {
      return;
    }

    this.activeInput = input;

    // Parse the current input value if it exists
    if (input.value) {
      const date = new Date(input.value);
      if (!isNaN(date.getTime())) {
        this.currentDate = new Date(date);
        this.selectedDate = new Date(date);
      }
    } else {
      // If no value, set to today
      this.currentDate = new Date();
      this.selectedDate = new Date();
    }

    this.renderCalendar();
    this.renderMonthShortNames();
    this.updateNavigationState();
    this.positionDatePickerUnderInput(input);
    this.showDatePicker();
  }

  private positionDatePickerUnderInput(input: HTMLInputElement) {
    if (!this.containerElement) return;

    const inputRect = input.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft =
      window.pageXOffset || document.documentElement.scrollLeft;

    this.containerElement.style.position = "absolute";
    this.containerElement.style.top = `${inputRect.bottom + scrollTop}px`;
    this.containerElement.style.left = `${inputRect.left + scrollLeft}px`;
    this.containerElement.style.zIndex = "1000";
  }

  private initializeDatePicker() {
    this.renderMonthShortNames();
    this.renderCalendar();
    this.updateNavigationState();
  }

  private showDatePicker() {
    if (this.containerElement) {
      this.containerElement.classList.remove(
        this.config.classes.wrapper.hidden,
      );
    }
  }

  private hideDatePicker() {
    if (this.containerElement) {
      this.containerElement.classList.add(this.config.classes.wrapper.hidden);
    }
  }

  private isDatePickerVisible(): boolean {
    return this.containerElement
      ? !this.containerElement.classList.contains(
          this.config.classes.wrapper.hidden,
        )
      : false;
  }

  private getSelectedLanguage(): LanguageConfig {
    const languageAttr =
      this.containerElement?.getAttribute("data-language") || "tr";
    return (
      this.config.language.find((lang) => lang.language === languageAttr) ||
      this.config.language[0]
    );
  }

  private renderMonthShortNames() {
    if (!this.monthShortNamePointer) return;
    const { monthNames } = this.getSelectedLanguage();
    const { classes } = this.config;
    const currentMonthIndex = this.currentDate.getMonth();

    this.monthShortNamePointer.innerHTML = `
      <div class="${classes.month.container}">
        <span class="${classes.month.current}">
          ${monthNames[currentMonthIndex]}
        </span>
      </div>`;
  }

  private renderCalendar() {
    if (!this.daysContainer) return;
    const { dayNames } = this.getSelectedLanguage();
    const { classes } = this.config;

    const firstDayOfMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
      1,
    );
    const lastDayOfMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth() + 1,
      0,
    );
    const startingDay = firstDayOfMonth.getDay();

    let calendarHTML = `<div class="${classes.calendar.grid}">`;

    dayNames.forEach((day) => {
      calendarHTML += `<div class="${classes.calendar.dayHeader}">${day.substring(0, 2)}</div>`;
    });

    for (let i = 0; i < startingDay; i++) {
      calendarHTML += `<div class="${classes.day.base} ${classes.day.empty}"></div>`;
    }

    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const currentDate = new Date(
        this.currentDate.getFullYear(),
        this.currentDate.getMonth(),
        i,
      );
      const isValid = this.isDateValid(currentDate);
      const isSelected = this.selectedDate?.getTime() === currentDate.getTime();

      const dayClasses = [
        classes.day.base,
        !isValid ? classes.day.disabled : "",
        isSelected ? classes.day.selected : "",
      ]
        .filter(Boolean)
        .join(" ");

      calendarHTML += `
        <div class="${dayClasses}" data-date="${currentDate.toISOString()}">
          ${i}
        </div>`;
    }

    calendarHTML += "</div>";
    this.daysContainer.innerHTML = calendarHTML;
  }

  private addEventListeners() {
    this.prevButton?.addEventListener("click", () => this.changeMonth("prev"));
    this.nextButton?.addEventListener("click", () => this.changeMonth("next"));
    this.resetButton?.addEventListener("click", () => this.resetToToday());

    this.daysContainer?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (
        target.classList.contains(this.config.classes.day.base) &&
        !target.classList.contains(this.config.classes.day.empty)
      ) {
        const dateStr = target.getAttribute("data-date");
        if (dateStr) {
          const date = new Date(dateStr);
          this.selectDate(date);
        }
      }
    });

    // Close date picker when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.containerElement &&
        !this.containerElement.contains(e.target as Node) &&
        !(e.target as HTMLElement).classList.contains("date-input")
      ) {
        this.hideDatePicker();
      }
    });
  }

  private updateNavigationState() {
    const { minDate, maxDate } = this.config;
    const currentMonth = new Date(
      this.currentDate.getFullYear(),
      this.currentDate.getMonth(),
    );

    if (this.prevButton && minDate) {
      const isDisabled = currentMonth <= minDate;
      this.prevButton.classList.toggle(
        this.config.classes.month.pointer.prev.disabled,
        isDisabled,
      );
      (this.prevButton as HTMLButtonElement).disabled = isDisabled;
    }

    if (this.nextButton && maxDate) {
      const isDisabled = currentMonth >= maxDate;
      this.nextButton.classList.toggle(
        this.config.classes.month.pointer.next.disabled,
        isDisabled,
      );
      (this.nextButton as HTMLButtonElement).disabled = isDisabled;
    }
  }

  private isDateValid(date: Date): boolean {
    const { minDate, maxDate } = this.config;
    if (minDate && date < minDate) return false;
    if (maxDate && date > maxDate) return false;
    return true;
  }

  public changeMonth(direction: "next" | "prev") {
    const newMonth =
      direction === "next"
        ? this.currentDate.getMonth() + 1
        : this.currentDate.getMonth() - 1;

    this.currentDate.setMonth(newMonth);
    this.renderMonthShortNames();
    this.renderCalendar();
    this.updateNavigationState();
  }

  public selectDate(date: Date) {
    if (this.isDateValid(date)) {
      this.selectedDate = date;
      if (this.activeInput) {
        this.activeInput.value = date.toLocaleDateString();
        this.hideDatePicker();
      }
      this.renderCalendar();
    }
  }

  public resetToToday() {
    const today = new Date();
    this.currentDate = new Date(today);
    this.selectDate(today);
    this.renderMonthShortNames();
    this.renderCalendar();
    this.updateNavigationState();
  }
}

export { DatePicker };
export type { LanguageConfig, DatePickerConfig };
