import { ModalController } from './packages/modal.js'

document.addEventListener('DOMContentLoaded', () => {
  new ModalController(
    [
      {
        id: 'profile-menu',
        toggleElements: ['#profile-menu-button'],
        openElements: [],
        contentElement: '#profile-navigation',
        closeElements: [],
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
})
