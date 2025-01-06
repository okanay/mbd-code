import { ModalMap } from '../packages/leaflet.js'

document.addEventListener('DOMContentLoaded', () => {
  new ModalMap(
    {
      mapId: 'map-modal',
    },
    {
      zoomInIconUrl: '/assets/images/leaflet/plus.svg',
      zoomOutIconUrl: '/assets/images/leaflet/minus.svg',
      layerControlToggleIconUrl: '/assets/images/leaflet/layer.svg',
      markerShadowUrl: '/assets/images/leaflet/shadow.svg',

      markerIconUrl: '/assets/images/leaflet/marker.png',
      markerIconSize: [24, 24],
      markerIconAnchor: [24, 24],
      markerShadowAnchor: [28, 22],
      markerShadowSize: [41, 24],
    },
  )
})
