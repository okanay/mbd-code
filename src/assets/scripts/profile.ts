import { ModalController } from './packages/modal.js'

document.addEventListener('DOMContentLoaded', () => {
  new ModalController(
    [
      {
        id: 'profile-menu',
        toggleElements: ['#profile-menu-button'],
        openElements: [],
        contentElement: '#profile-navigation',
        closeElements: [
          '#profile-info-1',
          '#profile-info-2',
          '#profile-info-3',
          '#profile-info-4',
          '#profile-info-5',
        ],
        containers: ['#profile-navigation-content', '#profile-navigation'],
      },
    ],
    {
      outsideClickClose: true,
      escapeClose: true,
      preserveModalHistory: false,
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
        id: 'reservation',
        toggleElements: [],
        openElements: ['#profile-info-1'],
        contentElement: '#profile-content-1',
        closeElements: [],
        containers: ['#profile-content-1'],
      },
      {
        id: 'favorites',
        toggleElements: [],
        openElements: ['#profile-info-2'],
        contentElement: '#profile-content-2',
        closeElements: [],
        containers: ['#profile-content-2'],
      },
      {
        id: 'profile-details',
        toggleElements: [],
        openElements: ['#profile-info-3'],
        contentElement: '#profile-content-3',
        closeElements: [],
        containers: ['#profile-content-3'],
      },
      {
        id: 'password-email',
        toggleElements: [],
        openElements: ['#profile-info-4'],
        contentElement: '#profile-content-4',
        closeElements: [],
        containers: ['#profile-content-4'],
      },
      {
        id: 'preferences',
        toggleElements: [],
        openElements: ['#profile-info-5'],
        contentElement: '#profile-content-5',
        closeElements: [],
        containers: ['#profile-content-5'],
      },
    ],
    {
      initialActiveModal: 'reservation',
      outsideClickClose: false,
      escapeClose: false,
      preserveModalHistory: false,
      attributes: {
        stateAttribute: 'data-state',
        values: {
          open: 'open',
          preserved: 'open',
          hidden: 'closed',
        },
      },
      scrollTo: {
        enabled: true,
        behavior: 'smooth',
        block: 'start',
        inline: 'start',
        offset: 160,
      },
      scrollLock: {
        enabled: false,
      },
      urlState: {
        enabled: true,
        queryParam: 'view',
        modals: [
          'reservation',
          'favorites',
          'profile-details',
          'password-email',
          'preferences',
        ],
      },
    },
  )
})
