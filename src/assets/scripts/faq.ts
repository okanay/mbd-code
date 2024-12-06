import { AccordionController } from './packages/accordion.js'

document.addEventListener('DOMContentLoaded', () => {
  const hiddenFAQ = new AccordionController({
    container: '#faq-hidden-container',
    accordionSelector: '.faq-2',
    toggleButtonSelector: '.faq-toggle-2',
    contentSelector: '.faq-content-2',
    iconSelector: '.faq-icon-2',
    defaultOpenIndex: -1,
    closeOthersOnOpen: true,
    animation: {
      enabled: true,
      duration: 300,
      timingFunction: 'ease',
    },
    attributes: {
      stateAttribute: 'data-state',
    },
    classes: {
      activeClass: 'faq-active',
      inactiveClass: 'faq-inactive',
    },
  })

  new AccordionController({
    container: '#faq-container-1',
    accordionSelector: '.faq',
    toggleButtonSelector: '.faq-toggle',
    contentSelector: '.faq-content',
    iconSelector: '.faq-icon',
    defaultOpenIndex: 0,
    closeOthersOnOpen: true,
    animation: {
      enabled: true,
      duration: 300,
      timingFunction: 'ease',
    },
    attributes: {
      stateAttribute: 'data-state',
    },
    classes: {
      activeClass: 'faq-active',
      inactiveClass: 'faq-inactive',
    },
    onToggle: () => {
      hiddenFAQ.recalculate()
    },
  })
})
