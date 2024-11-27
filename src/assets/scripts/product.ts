// prettier-ignore
import { ImageGalleryTracker, UpdateProductSliderDataItems, UpdateElementInnerHTMLById} from "./packages/image-gallery.js";
import { Slider } from './packages/slider.js'
import { TouchDirectionDetector } from './packages/touch-event.js'
import { ModalController } from './packages/modal.js'
import { RatingBarController } from '../../../dist/assets/scripts/packages/rating-bar-controller.js'

document.addEventListener('DOMContentLoaded', () => {
  const gallery = new ImageGalleryTracker({
    activeThumbnailClass: 'thumbnail-active',
    thumbnailClass: 'thumbnail',
    thumbnailsContainerId: 'gallery-modal-thumbnails',
    mainImageContainerId: 'gallery-modal-main-image-container',
    modalId: 'gallery-modal',
    sourceContainerId: 'product-slider',
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

  const slider = new Slider({
    container: '#product-slider-container',
    slideSelector: '.product-slide',
    buttonSelector: '.product-slider-btn',
    defaultActiveIndex: 0,
    activeButtonClass: 'product-slider-active-btn',
    activeButtonClassTarget: '.product-slider-btn-item',
    auto: true,
    autoInterval: 6000,
    animationConfig: {
      duration: 1000,
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

  new TouchDirectionDetector('product-slider-container', {
    threshold: 50,
    onSwipe: direction => {
      if (direction === 'right') {
        return slider.prev()
      }
      if (direction === 'left') {
        return slider.next()
      }
    },
  })

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

  new ModalController(
    [
      {
        id: 'gallery-modal',
        toggleElements: ['.product-slide', '#gallery-modal-close-button'],
        contentElement: '#gallery-modal',
        closeElements: ['#gallery-modal-close-button'],
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

  const ratingController = new RatingBarController({
    containerSelector: '#rating-container',
    barSelector: '.rating-bar',
    animationDuration: 1000,
    modalId: 'pim-3',
  })

  new ModalController(
    [
      {
        id: 'pim-1',
        toggleElements: [],
        openElements: ['#product-info-btn-1'],
        contentElement: '#product-info-content-1',
        closeElements: [],
        containers: ['#product-info-content-1'],
      },
      {
        id: 'pim-2',
        toggleElements: [],
        openElements: ['#product-info-btn-2'],
        contentElement: '#product-info-content-2',
        closeElements: [],
        containers: ['#product-info-content-2'],
      },
      {
        id: 'pim-3',
        toggleElements: [],
        openElements: ['#product-info-btn-3'],
        contentElement: '#product-info-content-3',
        closeElements: [],
        containers: ['#product-info-content-3'],
      },
    ],
    {
      initialActiveModal: 'pim-1',
      urlState: {
        enabled: true,
        queryParam: 'm',
        modals: ['pim-1', 'pim-2', 'pim-3'],
      },
      outsideClickClose: false,
      escapeClose: false,
      preserveModalHistory: false,
      scrollLock: {
        enabled: false,
      },
      onToggle(modalId, state) {
        ratingController.handleModalToggle(modalId, state)
      },
    },
  )
})
