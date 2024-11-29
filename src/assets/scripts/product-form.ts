import type { LanguageConfig } from './packages/date-picker.js'
import { DatePicker } from './packages/date-picker.js'
import { CompleteProductButton } from './packages/product-complete-btn.js'
import { NavStickyManager } from './packages/scroll-style.js'

document.addEventListener('DOMContentLoaded', () => {
  new CompleteProductButton({
    elements: {
      formContainerId: '#purchase-form',
      completePurchaseContainer: '#complete-purchase-container',
    },
    options: {
      threshold: {
        start: 0.7,
        end: 0.15,
      },
      animationOptions: {
        active: {
          bottom: '0',
          opacity: '1',
          transition: 'all 2000ms ease-in-out',
        },
        exit: {
          bottom: '-100%',
          opacity: '0',
          transition: 'all 2000ms ease-in-out',
        },
      },
    },
  })

  new DatePicker({
    input: {
      type: 'two',
      elements: {
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
    elements: {
      container: 'date-picker-container',
      monthContainer: 'date-picker-current-month-name',
      daysContainer: 'date-picker-days',
      buttons: {
        prev: 'prev-month-btn',
        next: 'next-month-btn',
        reset: 'reset-to-today-btn',
        resetAll: 'reset-all-btn',
      },
    },
    minDate: new Date(),
    maxDate: new Date(8640000000000000),
    autoClose: true,
    autoSwitchInput: true,
    output: {
      order: ['day', 'month', 'year'],
      slash: '.',
      between: ' & ',
    },
    language: [turkishLanguage, englishLanguage, arabicLanguage],
  })

  new NavStickyManager({
    navId: '#product-nav',
    contentId: '#product-content',
    mobileOnly: true, // Sadece mobilde çalışsın
    mobileBreakpoint: 1080, // 1080 altında aktif olsun
    animationDuration: 300, // 300ms animasyon süresi
    fixedStyles: {
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100%',
      zIndex: '100',
      backgroundColor: '#fff',
      borderBottom: '1px solid #eee',
      transition: 'all 300ms ease', // Animasyon için
    },
  })

  //
})

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
