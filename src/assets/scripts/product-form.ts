import { DatePicker } from "./packages/date-picker.js";
import type { LanguageConfig } from "./packages/date-picker.js";

const turkishLanguage: LanguageConfig = {
  language: "tr",
  monthNames: [
    "Ocak",
    "Şubat",
    "Mart",
    "Nisan",
    "Mayıs",
    "Haziran",
    "Temmuz",
    "Ağustos",
    "Eylül",
    "Ekim",
    "Kasım",
    "Aralık",
  ],
  dayNames: ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"],
};

const englishLanguage: LanguageConfig = {
  language: "en",
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

document.addEventListener("DOMContentLoaded", () => {
  new DatePicker({
    language: [turkishLanguage, englishLanguage],
    minDate: new Date(2024, 0, 1),
    maxDate: new Date(2025, 11, 31),
    containers: {
      input: "date-picker-input",
      container: "date-picker-container",
      monthContainer: "date-picker-months",
      daysContainer: "date-picker-days",
      pointer: {
        prev: "prev-month-btn",
        next: "next-month-btn",
      },
    },
    classes: {
      day: {
        base: "day",
        disabled: "day--disabled",
        selected: "day--selected",
        empty: "day--empty",
      },
      month: {
        container: "month-container",
        current: "month-current",
        pointer: {
          prev: {
            base: "month-nav-prev",
            disabled: "month-nav-disabled",
          },
          next: {
            base: "month-nav-next",
            disabled: "month-nav-disabled",
          },
        },
      },
      calendar: {
        grid: "calendar-grid",
        dayHeader: "calendar-header",
      },
    },
  });
});
