// prettier-ignore
import { arabicLanguage, englishLanguage, turkishLanguage } from '../constants/index.js'
// prettier-ignore
import { ImageGalleryTracker, UpdateProductSliderDataItems, UpdateElementInnerHTMLById} from "./packages/image-gallery.js";
import { Slider } from './packages/slider.js'
import { TouchDirectionDetector } from './packages/touch-event.js'
import { ModalController } from './packages/modal.js'
import { RatingAnimator } from './packages/rating-bar-controller.js'
import { URLMatcher } from './packages/url-matcher.js'
import { DatePicker } from './packages/date-picker.js'
import { ScrollManager } from './packages/floating-elements.js'
import { NavStickyManager } from './packages/scroll-style.js'

document.addEventListener('DOMContentLoaded', () => {
  // Product Slider Instance
  const MainSlider = new Slider({
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
        clone: 40,
        selected: 30,
        notSelected: 20,
      },
    },
  })

  // Slider touch event detector
  new TouchDirectionDetector('product-slider-container', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'right') {
        return MainSlider.prev()
      }
      if (direction === 'left') {
        return MainSlider.next()
      }
    },
  })

  // Image Gallery Instance for Product Slider
  const gallery = new ImageGalleryTracker({
    elements: {
      modalId: 'gallery-modal',
      mainImageContainerId: 'gallery-modal-main-image-container',
      thumbnailsContainerId: 'gallery-modal-thumbnails',
      sourceContainerId: 'product-slider',
      prevButtonId: 'prev-image-gallery',
      nextButtonId: 'next-image-gallery',
    },
    activeThumbnailClass: 'thumbnail-active',
    thumbnailClass: 'thumbnail',
    dataSrcAttribute: 'data-src',
    sourceImageSelector: '.product-slide img',
    onImageCount: count => {
      UpdateProductSliderDataItems('product-slider', {
        min: 1,
        max: 5,
        childElements: count,
        dataItems: 'auto-detected',
      })
      UpdateElementInnerHTMLById('product-slider-image-count', count.toString())
    },
  })

  // Image Gallery Modal Controller
  new ModalController(
    [
      {
        id: 'gallery-modal',
        toggleElements: ['.product-slide', '#close-image-gallery'],
        contentElement: '#gallery-modal',
        closeElements: ['#close-image-gallery'],
        containers: ['#gallery-modal-content'],
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
        enabled: true,
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
      onToggle: (_, __, trigger) => {
        const index = trigger?.getAttribute('data-index')
        const indexNumber = index ? parseInt(index, 10) : 0
        gallery.openGallery(indexNumber)
      },
    },
  )

  // Image Gallery Modal Touch Event Detector
  new TouchDirectionDetector('gallery-modal-main-image-container', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'right') {
        return gallery.prevImage()
      }
      if (direction === 'left') {
        return gallery.nextImage()
      }
    },
  })

  // Product Info Modal Controller
  new ModalController(
    [
      {
        id: 'info',
        toggleElements: [],
        openElements: ['#product-info-btn-1'],
        contentElement: '#product-info-content-1',
        closeElements: [],
        containers: ['#product-info-content-1'],
      },
      {
        id: 'includes',
        toggleElements: [],
        openElements: ['#product-info-btn-2'],
        contentElement: '#product-info-content-2',
        closeElements: [],
        containers: ['#product-info-content-2'],
      },
      {
        id: 'reviews',
        toggleElements: [],
        openElements: ['#product-info-btn-3'],
        contentElement: '#product-info-content-3',
        closeElements: [],
        containers: ['#product-info-content-3'],
      },
    ],
    {
      initialActiveModal: 'info',
      urlState: {
        enabled: true,
        queryParam: 'view',
        modals: ['info', 'includes', 'reviews'],
      },
      scrollTo: {
        enabled: true,
        behavior: 'smooth',
        block: 'start',
        inline: 'start',
        offset: 160,
      },
      outsideClickClose: false,
      escapeClose: false,
      preserveModalHistory: false,
      scrollLock: {
        enabled: false,
      },
    },
  )

  // Rating Animator Instance
  const ratingAnimator = new RatingAnimator({
    containerSelector: '#rating-container',
    barSelector: '.rating-bar',
    animationDuration: 1000,
  })

  // Rating Animator URL Listener
  const urlMatcher = new URLMatcher({
    queryParam: 'view',
    targetValues: ['reviews'],
  })

  // Rating Animator URL Listener
  urlMatcher.on('onFirstMatch', 'reviews', () => {
    ratingAnimator.animate()
  })

  // Date Picker Instance
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

  new ScrollManager([
    {
      id: 'complete-purchase-container',
      watchSelector: '#purchase-form',
      order: 1,
      position: {
        position: 'fixed',
        right: '0px',
        bottom: '0px',
        width: '100%',
        zIndex: '50',
        visibility: 'hidden',
        opacity: '0',
        transform: 'translateY(0%)',
        transition:
          'transform 500ms cubic-bezier(0.4, 0, 0.2, 1), opacity 500ms cubic-bezier(0.4, 0, 0.2, 1)',
        willChange: 'transform, opacity',
      },
      showAnimation: {
        visibility: 'visible',
        opacity: '1',
        transform: 'translateY(0%)',
      },
      hideAnimation: {
        visibility: 'hidden',
        opacity: '0',
        transform: 'translateY(100%)',
      },
      onClick: () => {
        document.querySelector('#purchase-form')?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      },
    },
    {
      id: 'whatsapp-button',
      order: 2,
      position: {
        position: 'fixed',
        right: '16px',
        bottom: '84px',
        visibility: 'hidden',
        opacity: '0%',
        transform: 'translateY(100%)',
        transition: 'all 0.3s ease-in-out',
        zIndex: '60',
      },
      showAnimation: {
        transition: 'all 0.3s ease-in-out',
        transform: 'translateY(-12px)',
        visibility: 'visible',
        opacity: '100%',
      },
      hideAnimation: {
        transition: 'all 0.3s ease-in-out',
        transform: 'translateY(120%)',
        visibility: 'hidden',
        opacity: '0%',
      },
    },
  ])

  // Mobile Screen Nav Sticky Manager
  new NavStickyManager({
    navId: '#product-nav',
    contentId: '#product-content',
    mobileOnly: true,
    mobileBreakpoint: 768,
    threshold: 50,
    fixedStyles: {
      zIndex: '100',
      maxWidth: '1232px',
      margin: '0 auto',
    },
  })
})
