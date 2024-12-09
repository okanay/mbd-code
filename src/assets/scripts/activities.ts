import { Carousel } from './packages/carousel.js'

document.addEventListener('DOMContentLoaded', () => {
  new Carousel('popular-activities', 'popular-prev-btn', 'popular-next-btn', {
    snapAlign: 'center',
    itemSpacing: 16,
    btnsDisableThreshold: 32,
    screenSizes: [
      { width: 1024, jumpVal: 3 },
      { width: 768, jumpVal: 2 },
      { width: 512, jumpVal: 1 },
    ],
  })

  new Carousel('luxury-activities', 'luxury-prev-btn', 'luxury-next-btn', {
    snapAlign: 'center',
    itemSpacing: 16,
    btnsDisableThreshold: 32,
    screenSizes: [
      { width: 1024, jumpVal: 3 },
      { width: 768, jumpVal: 2 },
      { width: 512, jumpVal: 1 },
    ],
  })

  new Carousel('water-activities', 'water-prev-btn', 'water-next-btn', {
    snapAlign: 'center',
    itemSpacing: 16,
    btnsDisableThreshold: 32,
    screenSizes: [
      { width: 1024, jumpVal: 3 },
      { width: 768, jumpVal: 2 },
      { width: 512, jumpVal: 1 },
    ],
  })
})
