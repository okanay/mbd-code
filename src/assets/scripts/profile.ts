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
          '#profile-view-control-1',
          '#profile-view-control-2',
          '#profile-view-control-3',
          '#profile-view-control-4',
          '#profile-view-control-5',
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
        openElements: ['#profile-view-control-1'],
        contentElement: '#reservation',
        closeElements: [],
        containers: ['#reservation'],
      },
      {
        id: 'favorites',
        toggleElements: [],
        openElements: ['#profile-view-control-2'],
        contentElement: '#favorites',
        closeElements: [],
        containers: ['#favorites'],
      },
      {
        id: 'profile-details',
        toggleElements: [],
        openElements: ['#profile-view-control-3'],
        contentElement: '#profile-details',
        closeElements: [],
        containers: ['#profile-details'],
      },
      {
        id: 'password-email',
        toggleElements: [],
        openElements: ['#profile-view-control-4'],
        contentElement: '#password-email',
        closeElements: [],
        containers: ['#password-email'],
      },
      {
        id: 'preferences',
        toggleElements: [],
        openElements: ['#profile-view-control-5'],
        contentElement: '#preferences',
        closeElements: [],
        containers: ['#preferences'],
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
