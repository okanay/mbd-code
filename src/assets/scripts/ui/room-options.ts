import { InputCounter } from '../packages/input-counter.js'
import { ModalController } from '../packages/modal.js'

document.addEventListener('DOMContentLoaded', () => {
  new ModalController(
    [
      {
        id: 'select-room-options',
        toggleElements: ['#select-room-options'],
        openElements: ['#select-room-options-container'],
        contentElement: '#select-room-options-container',
        closeElements: ['#people-select-close'],
        containers: ['#select-room-options-container'],
      },
    ],
    {
      outsideClickClose: true,
      escapeClose: true,
      preserveModalHistory: false,
      scrollLock: {
        enabled: false,
      },
    },
  )
})

// DOM yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
  const counterConfig = [
    {
      type: 'adult',
      dataAttribute: 'data-adult',
      textElementId: 'adult-text',
      minusButtonId: 'adult-minus',
      plusButtonId: 'adult-plus',
      countElementId: 'adult-count',
    },
    {
      type: 'child',
      dataAttribute: 'data-child',
      textElementId: 'child-text',
      minusButtonId: 'child-minus',
      plusButtonId: 'child-plus',
      countElementId: 'child-count',
    },
    {
      type: 'room',
      dataAttribute: 'data-room',
      textElementId: 'room-text',
      minusButtonId: 'room-minus',
      plusButtonId: 'room-plus',
      countElementId: 'room-count',
    },
  ]

  new InputCounter('select-room-options', counterConfig)
})
