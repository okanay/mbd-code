interface LanguageConfig {
  language: string;
  monthNames: string[];
  dayNames: string[];
}

interface DatePickerConfig {
  containers: {
    input: string;
    container: string;
    monthContainer: string;
    daysContainer: string;
    pointer: {
      prev: string;
      next: string;
    };
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
  private inputElement: HTMLElement | null;
  private prevButton: HTMLElement | null = null;
  private nextButton: HTMLElement | null = null;

  constructor(config: DatePickerConfig) {
    this.config = config;
    this.currentDate = new Date();
    this.monthShortNamePointer = document.getElementById(
      config.containers.monthContainer,
    );
    this.daysContainer = document.getElementById(
      config.containers.daysContainer,
    );
    this.containerElement = document.getElementById(
      config.containers.container,
    );
    this.inputElement = document.getElementById(config.containers.input);
    this.prevButton = document.getElementById(config.containers.pointer.prev);
    this.nextButton = document.getElementById(config.containers.pointer.next);

    if (
      !this.monthShortNamePointer ||
      !this.daysContainer ||
      !this.containerElement ||
      !this.inputElement
    ) {
      console.warn("One or more container elements not found.");
    } else {
      this.initializeDatePicker();
      this.addEventListeners();
    }
  }

  private initializeDatePicker() {
    this.renderMonthShortNames();
    this.renderCalendar();
    this.updateNavigationState();
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
        <button id="${this.config.containers.pointer.prev}"
                class="${classes.month.pointer.prev.base}">
          &lt;
        </button>
        <span class="${classes.month.current}">
          ${monthNames[currentMonthIndex]}
        </span>
        <button id="${this.config.containers.pointer.next}"
                class="${classes.month.pointer.next.base}">
          &gt;
        </button>
      </div>`;

    this.prevButton = document.getElementById(
      this.config.containers.pointer.prev,
    );
    this.nextButton = document.getElementById(
      this.config.containers.pointer.next,
    );
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
      if (this.inputElement) {
        (this.inputElement as HTMLInputElement).value =
          date.toLocaleDateString();
      }
      this.renderCalendar();
    }
  }
}

export { DatePicker };
export type { LanguageConfig, DatePickerConfig };
