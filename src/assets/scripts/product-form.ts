import { DatePicker } from './packages/date-picker.js'
import type { LanguageConfig } from './packages/date-picker.js'

const turkishLanguage: LanguageConfig = {
  language: 'tr',
  monthNames: [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ],
  dayNames: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
}

const arabicLanguage: LanguageConfig = {
  language: 'sa',
  monthNames: [
    'يناير',
    'فبراير',
    'مارس',
    'أبريل',
    'مايو',
    'يونيو',
    'يوليو',
    'أغسطس',
    'سبتمبر',
    'أكتوبر',
    'نوفمبر',
    'ديسمبر',
  ],
  dayNames: ['إثن', 'ثلا', 'أرع', 'خمي', 'جمع', 'سبت', 'الأحد'],
}

const englishLanguage: LanguageConfig = {
  language: 'en',
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  dayNames: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
}

document.addEventListener('DOMContentLoaded', () => {
  new DatePicker({
    language: [turkishLanguage, englishLanguage, arabicLanguage],
    minDate: new Date(),
    maxDate: new Date(8640000000000000),
    containers: {
      container: 'date-picker-container',
      monthContainer: 'date-picker-months',
      daysContainer: 'date-picker-days',
      pointer: {
        prev: 'prev-month-btn',
        next: 'next-month-btn',
      },
      reset: 'reset-to-today-btn',
      resetAll: 'reset-all-btn',
    },
    input: {
      type: 'range',
      config: {
        start: {
          id: 'departure-date',
          focusContainer: 'departure-container',
        },
        end: {
          id: 'return-date',
          focusContainer: 'return-container',
        },
      },
    },
  })

  const ratingContainer = document.querySelector('[data-total-comments]')
  const totalComments = Number(
    ratingContainer?.getAttribute('data-total-comments') || 0,
  )

  const ratingBars = document.querySelectorAll('[data-rate]')

  ratingBars.forEach(bar => {
    const rate = Number(bar.getAttribute('data-rate') || 0)
    const percentage = (rate / totalComments) * 100

    // Width değerini yüzdeye göre ayarla
    if (bar instanceof HTMLElement) {
      bar.style.width = `${percentage}%`
    }
  })
})
