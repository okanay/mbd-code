import { DatePicker, type DatePickerConfig } from './packages/date-picker.js'
import { ModalController } from './packages/modal.js'
import { Pagination } from './packages/pagination.js'
import { RangeSlider } from './packages/range-slider.js'
import { TouchDirectionDetector } from './packages/touch-event.js'

document.addEventListener('DOMContentLoaded', () => {
  new RangeSlider({
    containerId: 'price-range-1',
    minDisplayId: 'display-min-value-1',
    maxDisplayId: 'display-max-value-1',
    sliderRangeId: 'slider-range-1',
    minHandleId: 'min-handle-1',
    maxHandleId: 'max-handle-1',
    minInputId: 'min_price_1',
    maxInputId: 'max_price_1',
  })
})

document.addEventListener('DOMContentLoaded', () => {
  new ModalController(
    [
      {
        id: 'filter-modal',
        openElements: [],
        toggleElements: ['#filter-modal-button'],
        contentElement: '#filter-modal',
        closeElements: ['#filter-modal-close-button'],
        containers: ['#filter-container'],
      },
    ],
    {
      outsideClickClose: true,
      escapeClose: true,
      preserveModalHistory: true,
      attributes: {
        stateAttribute: 'data-state',
        values: {
          open: 'open',
          preserved: 'open',
          hidden: 'closed',
        },
      },
      scrollLock: {
        enabled: false,
        styles: {
          hidden: {
            overflow: 'hidden',
            position: 'fixed',
            width: '100%',
          },
          visible: {
            overflow: 'auto',
            position: 'static',
            width: 'auto',
          },
        },
      },
    },
  )
})

document.addEventListener('DOMContentLoaded', () => {
  new Pagination('pagination-container')
})

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
    autoClose: true,
    language: [...languages],
  }

  const datePicker = new DatePicker(datepickerConfig)

  new TouchDirectionDetector('date-picker', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'left') {
        return datePicker.changeMonth('next')
      }
      if (direction === 'right') {
        return datePicker.changeMonth('prev')
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
