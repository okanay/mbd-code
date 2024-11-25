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
    minDate: new Date(),
    maxDate: new Date(8640000000000000),
    containers: {
      container: "date-picker-container",
      monthContainer: "date-picker-months",
      daysContainer: "date-picker-days",
      pointer: {
        prev: "prev-month-btn",
        next: "next-month-btn",
      },
      reset: "reset-to-today-btn",
      resetAll: "reset-all-btn",
    },
    input: {
      type: "range", // veya "single"
      config: {
        start: {
          id: "departure-date",
        },
        end: {
          id: "return-date",
        },
      },
    },
  });
});
