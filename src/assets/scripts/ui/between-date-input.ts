import { DatePicker, type DatePickerConfig } from '../packages/date-picker.js'
import { TouchDirectionDetector } from '../packages/touch-event.js'

document.addEventListener('DOMContentLoaded', () => {
  const datepickerConfig: DatePickerConfig = {
    minDate: new Date(),
    elements: {
      container: 'date-picker',
      monthContainer: 'current-month',
      daysContainer: 'calendar-days',
      buttons: {
        prev: 'prev-month',
        next: 'next-month',
        reset: 'reset-date',
        resetAll: 'reset-all',
      },
    },
    input: {
      type: 'between',
      elements: {
        id: 'date-input',
      },
    },
    output: {
      order: ['year', 'month', 'day'],
      between: ' - ',
      slash: '-',
      fullFormat: true, // Yeni opsiyonel alan
      backendFormat: ['year', 'month', 'day'],
    },
    autoClose: false,
    language: [...languages],
  }

  const datePicker = new DatePicker(datepickerConfig)

  new TouchDirectionDetector('date-picker', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'left') {
        return datePicker.safeChangeMonth('next')
      }
      if (direction === 'right') {
        return datePicker.safeChangeMonth('prev')
      }
    },
  })
})

const languages = [
  {
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
  },
  {
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
  },
]
