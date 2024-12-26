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
      containerId: 'adult-container',
    },
    {
      type: 'child',
      dataAttribute: 'data-child',
      textElementId: 'child-text',
      minusButtonId: 'child-minus',
      plusButtonId: 'child-plus',
      countElementId: 'child-count',
      containerId: 'child-container',
    },
    {
      type: 'room',
      dataAttribute: 'data-room',
      textElementId: 'room-text',
      minusButtonId: 'room-minus',
      plusButtonId: 'room-plus',
      countElementId: 'room-count',
      containerId: 'room-container',
    },
  ]

  new InputCounter('select-room-options', counterConfig)
})

// Test için event listener ekleyelim
document.addEventListener('keydown', event => {
  if (event.key.toLowerCase() === 'p') {
    const adultContainer = document.getElementById('adult-container')
    if (adultContainer) {
      // Mevcut değerleri alalım
      const currentMin = Number(adultContainer.dataset.min || 1)
      const currentMax = Number(adultContainer.dataset.max || 4)

      // Değerleri değiştirelim
      adultContainer.dataset.min = String(currentMin + 1)
      adultContainer.dataset.max = String(currentMax - 1)

      console.log('Yeni değerler:', {
        min: adultContainer.dataset.min,
        max: adultContainer.dataset.max,
      })
    }
  }
})
