import { MultiGroupImageGallery } from '../packages/multi-group-gallery.js'
import { UpdateElementInnerHTMLById } from '../packages/multi-group-gallery.js'
import { UpdateProductSliderDataItems } from '../packages/multi-group-gallery.js'
import { Slider } from '../packages/slider.js'
import { TouchDirectionDetector } from '../packages/touch-event.js'

document.addEventListener('DOMContentLoaded', () => {
  // Product Slider Instance
  const mainSlider = new Slider({
    container: '#product-slider-container',
    slideSelector: '.product-slide',
    buttonSelector: '.product-slider-btn',
    nextButtonSelector: '#slider-next',
    prevButtonSelector: '#slider-prev',
    defaultActiveIndex: 0,
    activeButtonClass: 'product-slider-active-btn',
    activeButtonClassTarget: '.product-slider-btn-item',
    auto: true,
    autoInterval: 6000,
    animationConfig: {
      duration: 400,
      timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      transforms: {
        fromLeft: {
          enter: 'translate(-120%, 0%)',
          exit: 'translate(20%, 0%)',
        },
        fromRight: {
          enter: 'translate(120%, 0%)',
          exit: 'translate(-20%, 0%)',
        },
      },
      opacitySelected: 1,
      opacityNotSelected: 0.75,
      scaleSelected: 1,
      scaleNotSelected: 1,
    },
    responsive: {
      enabled: true,
      minWidth: 0,
      maxWidth: 1024,
    },
    options: {
      zIndex: {
        clone: 3,
        selected: 2,
        notSelected: 1,
      },
    },
  })

  // #product-slider
  const productSliderElement = document.getElementById('product-slider')
  const childCount = productSliderElement
    ? productSliderElement.children.length
    : 0

  UpdateProductSliderDataItems('product-slider', {
    min: 1,
    max: 5,
    childElements: childCount,
    dataItems: 'auto-detected',
  })
  UpdateElementInnerHTMLById(
    'product-slider-image-count',
    childCount.toString(),
  )

  // Mobile Package Slider Instance
  const config = {
    auto: true,
    autoInterval: 6000,
    animationConfig: {
      duration: 400,
      timingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
      transforms: {
        fromLeft: {
          enter: 'translate(-120%, 0%)',
          exit: 'translate(20%, 0%)',
        },
        fromRight: {
          enter: 'translate(120%, 0%)',
          exit: 'translate(-20%, 0%)',
        },
      },
      opacitySelected: 1,
      opacityNotSelected: 0.75,
      scaleSelected: 1,
      scaleNotSelected: 1,
    },
    options: {
      zIndex: {
        clone: 3,
        selected: 2,
        notSelected: 1,
      },
    },
  }

  new Slider({
    container: '#slider-container-1-desktop',
    slideSelector: '.slide-1-desktop',
    buttonSelector: '.slide-1-btn-desktop',
    nextButtonSelector: '#slider-1-next-desktop',
    prevButtonSelector: '#slider-1-prev-desktop',
    defaultActiveIndex: 0,
    activeButtonClass: 'product-slider-active-btn',
    activeButtonClassTarget: '.slide-1-btn-desktop',
    ...config,
  })

  new Slider({
    container: '#slider-container-2-desktop',
    slideSelector: '.slide-2-desktop',
    buttonSelector: '.slide-2-btn-desktop',
    nextButtonSelector: '#slider-2-next-desktop',
    prevButtonSelector: '#slider-2-prev-desktop',
    defaultActiveIndex: 0,
    activeButtonClass: 'product-slider-active-btn',
    activeButtonClassTarget: '.slide-2-btn-desktop',
    ...config,
  })

  new Slider({
    container: '#slider-container-3-desktop',
    slideSelector: '.slide-3-desktop',
    buttonSelector: '.slide-3-btn-desktop',
    nextButtonSelector: '#slider-3-next-desktop',
    prevButtonSelector: '#slider-3-prev-desktop',
    defaultActiveIndex: 0,
    activeButtonClass: 'product-slider-active-btn',
    activeButtonClassTarget: '.slide-3-btn-desktop',
    ...config,
  })

  new Slider({
    container: '#slider-container-4-desktop',
    slideSelector: '.slide-4-desktop',
    buttonSelector: '.slide-4-btn-desktop',
    nextButtonSelector: '#slider-4-next-desktop',
    prevButtonSelector: '#slider-4-prev-desktop',
    defaultActiveIndex: 0,
    activeButtonClass: 'product-slider-active-btn',
    activeButtonClassTarget: '.slide-4-btn-desktop',
    ...config,
  })

  const mobileSlider1 = new Slider({
    container: '#slider-container-1',
    slideSelector: '.slide-1',
    buttonSelector: '.slide-1-btn',
    nextButtonSelector: '#slider-1-next',
    prevButtonSelector: '#slider-1-prev',
    defaultActiveIndex: 0,
    activeButtonClass: 'product-slider-active-btn',
    activeButtonClassTarget: '.slide-1-btn',
    ...config,
  })

  const mobileSlider2 = new Slider({
    container: '#slider-container-2',
    slideSelector: '.slide-2',
    buttonSelector: '.slide-2-btn',
    nextButtonSelector: '#slider-2-next',
    prevButtonSelector: '#slider-2-prev',
    defaultActiveIndex: 0,
    activeButtonClass: 'product-slider-active-btn',
    activeButtonClassTarget: '.slide-2-btn',
    ...config,
  })

  const mobileSlider3 = new Slider({
    container: '#slider-container-3',
    slideSelector: '.slide-3',
    buttonSelector: '.slide-3-btn',
    nextButtonSelector: '#slider-3-next',
    prevButtonSelector: '#slider-3-prev',
    defaultActiveIndex: 0,
    activeButtonClass: 'product-slider-active-btn',
    activeButtonClassTarget: '.slide-3-btn',
    ...config,
  })

  const mobileSlider4 = new Slider({
    container: '#slider-container-4',
    slideSelector: '.slide-4',
    buttonSelector: '.slide-4-btn',
    nextButtonSelector: '#slider-4-next',
    prevButtonSelector: '#slider-4-prev',
    defaultActiveIndex: 0,
    activeButtonClass: 'product-slider-active-btn',
    activeButtonClassTarget: '.slide-4-btn',
    ...config,
  })

  const multiGroupGallery = new MultiGroupImageGallery({
    elements: {
      modalId: 'multi-gallery',
      modalContentId: 'multi-gallery-content',
      mainImageContainerId: 'multi-gallery-main-image-container',
      thumbnailsContainerId: 'multi-gallery-thumbnails',
      prevButtonId: 'prev-multi-gallery',
      nextButtonId: 'next-multi-gallery',
      closeButtonId: 'close-multi-gallery',
    },
    groups: [
      {
        containerId: 'product-slider',
        slideItemClass: 'product-slide',
      },
      {
        containerId: 'slider-1-desktop',
        slideItemClass: 'slide-1-desktop',
      },
      {
        containerId: 'slider-2-desktop',
        slideItemClass: 'slide-2-desktop',
      },
      {
        containerId: 'slider-3-desktop',
        slideItemClass: 'slide-3-desktop',
      },
      {
        containerId: 'slider-4-desktop',
        slideItemClass: 'slide-4-desktop',
      },
      {
        containerId: 'slider-1',
        slideItemClass: 'slide-1',
      },
      {
        containerId: 'slider-2',
        slideItemClass: 'slide-2',
      },
      {
        containerId: 'slider-3',
        slideItemClass: 'slide-3',
      },
      {
        containerId: 'slider-4',
        slideItemClass: 'slide-4',
      },
    ],
    thumbnailClass: 'thumbnail',
    activeThumbnailClass: 'thumbnail-active',
  })

  // Slider touch event detector
  new TouchDirectionDetector('product-slider-container', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'right') {
        return mainSlider.prev()
      }
      if (direction === 'left') {
        return mainSlider.next()
      }
    },
  })

  new TouchDirectionDetector('multi-gallery-main-image-container', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'right') {
        return multiGroupGallery.navigateGallery('prev')
      }
      if (direction === 'left') {
        return multiGroupGallery.navigateGallery('next')
      }
    },
  })

  new TouchDirectionDetector('slider-container-1', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'right') {
        return mobileSlider1.prev()
      }
      if (direction === 'left') {
        return mobileSlider1.next()
      }
    },
  })

  new TouchDirectionDetector('slider-container-2', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'right') {
        return mobileSlider2.prev()
      }
      if (direction === 'left') {
        return mobileSlider2.next()
      }
    },
  })

  new TouchDirectionDetector('slider-container-3', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'right') {
        return mobileSlider3.prev()
      }
      if (direction === 'left') {
        return mobileSlider3.next()
      }
    },
  })

  new TouchDirectionDetector('slider-container-4', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'right') {
        return mobileSlider4.prev()
      }
      if (direction === 'left') {
        return mobileSlider4.next()
      }
    },
  })
})
