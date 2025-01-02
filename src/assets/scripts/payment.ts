import { ModalMap } from './packages/leaflet.js'

document.addEventListener('DOMContentLoaded', () => {
  new ModalMap(
    {
      mapId: 'map-modal',
    },
    {
      iconPath: '/assets/images/leaflet/marker.png',
      markerIconUrl: '/assets/images/leaflet/marker.png',
      markerIconSize: [32, 32],
      markerIconAnchor: [16, 32],
    },
  )
})
