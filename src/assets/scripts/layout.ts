import { AccordionController } from './packages/accordion.js'
import { ModalController } from './packages/modal.js'
import { LazyImageLoadController } from './packages/lazy-load-controller.js'
import { createIcons, icons } from './deps/lucide-icons.js'
import { RTLIconManager } from './packages/icon-direction-manager.js'
document.addEventListener('DOMContentLoaded', async () => {
  createIcons({ icons: { ...icons } })

  const rtlIconConfig = {
    patterns: [
      'chevron-left.svg',
      'chevron-right.svg',
      'arrow-left.svg',
      'arrow-right.svg',
    ],
    lucideIcons: [
      'chevron-left',
      'chevron-right',
      'arrow-left',
      'arrow-right',
      'panel-right-close',
      'panel-right-open',
    ],
  }

  new RTLIconManager(rtlIconConfig)

  new LazyImageLoadController({
    imageSelector: '.lazy-image',
    dataAttribute: 'data-src',
    rootMargin: '100px 0px',
    threshold: 0.2,
    filterStyle: 'blur(5px)',
    maxConcurrentLoads: 3,
  })

  new ModalController(
    [
      {
        id: 'language-menu',
        toggleElements: [],
        openElements: [
          '#language-currency-selector-button',
          '#language-currency-selector-button-mobile',
        ],
        contentElement: '#language-currency-selector-options',
        closeElements: ['#language-selector-closed-button'],
        containers: ['#language-currency-selector-options-content'],
      },
      {
        id: 'mobile-menu',
        toggleElements: ['#mobile-menu-button'],
        openElements: [],
        contentElement: '#mobile-navigation',
        closeElements: [],
        containers: ['#mobile-navigation-content'],
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
    },
  )

  new ModalController(
    [
      {
        id: 'nav-1',
        toggleElements: [],
        openElements: ['#footer-nav-1-btn'],
        contentElement: '#footer-nav-1',
        closeElements: [],
        containers: ['#footer-nav-1'],
      },
      {
        id: 'nav-2',
        toggleElements: [],
        openElements: ['#footer-nav-2-btn'],
        contentElement: '#footer-nav-2',
        closeElements: [],
        containers: ['#footer-nav-2'],
      },
      {
        id: 'nav-3',
        toggleElements: [],
        openElements: ['#footer-nav-3-btn'],
        contentElement: '#footer-nav-3',
        closeElements: [],
        containers: ['#footer-nav-3'],
      },
    ],
    {
      initialActiveModal: 'nav-1',
      outsideClickClose: false,
      escapeClose: false,
      preserveModalHistory: false,
      scrollLock: {
        enabled: false,
      },
    },
  )

  new ModalController(
    [
      {
        id: 'desktop-nav-1',
        openElements: [],
        toggleElements: ['#desktop-nav-1-btn'],
        contentElement: '#desktop-nav-1-content',
        closeElements: [],
        containers: ['#desktop-nav-1'],
      },
      {
        id: 'desktop-nav-2',
        openElements: [],
        toggleElements: ['#desktop-nav-2-btn'],
        contentElement: '#desktop-nav-2-content',
        closeElements: [],
        containers: ['#desktop-nav-2'],
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

  new AccordionController({
    container: '#footer-container',
    accordionSelector: '.footer',
    toggleButtonSelector: '.footer-toggle',
    contentSelector: '.footer-content',
    iconSelector: '.footer-icon',
    defaultOpenIndex: 4,
    closeOthersOnOpen: false,
    animation: {
      enabled: true,
      duration: 300,
      timingFunction: 'ease',
    },
    attributes: {
      stateAttribute: 'data-state',
    },
    classes: {
      activeClass: 'footer-active',
      inactiveClass: 'footer-inactive',
    },
  })
})
