import * as leaflet from '../deps/leaflet/leaflet-src.esm.js'
const L = leaflet as any

// Interfaces
interface MapModalElements {
  modalId: string
  modalContentId: string
  mapContainerId: string
  closeButtonId: string
  mapId?: string
}

interface MapIconOptions {
  iconPath?: string // İkon dosyalarının bulunduğu klasör yolu
  markerIconUrl?: string // Özel marker ikonu URL'si
  markerIconSize?: [number, number] // Marker ikonu boyutu
  markerIconAnchor?: [number, number] // Marker ikonu anchor noktası
}

interface EmbeddedMapConfig {
  containerId: string
  coordinate: string
  iconOptions?: MapIconOptions
}

// Global map instances yönetimi
class MapInstanceManager {
  private static instances: Map<string, ModalMap> = new Map()

  static addInstance(id: string, instance: ModalMap): void {
    this.instances.set(id, instance)
  }

  static getInstance(id: string): ModalMap | undefined {
    return this.instances.get(id)
  }

  static refreshInstance(id: string): boolean {
    const instance = this.instances.get(id)
    if (instance) {
      instance.refreshButtons()
      return true
    }
    return false
  }
}

declare global {
  interface Window {
    RefreshMapButtons: (mapId: string) => boolean
  }
}

window.RefreshMapButtons = function (mapId: string): boolean {
  return MapInstanceManager.refreshInstance(mapId)
}

// Modal Map Class
class ModalMap {
  private modal: HTMLElement
  private mapContainer: HTMLElement
  private closeButton: HTMLElement
  private elements: MapModalElements
  private mapButtons: NodeListOf<Element>
  private map: L.Map | null = null
  private iconOptions: MapIconOptions

  constructor(
    options: Partial<MapModalElements> = {},
    iconOptions: MapIconOptions = {},
  ) {
    const defaultElements: MapModalElements = {
      modalId: 'map-modal',
      modalContentId: 'map-modal-content',
      mapContainerId: 'map-container',
      closeButtonId: 'close-map-modal',
    }

    this.elements = { ...defaultElements, ...options }
    this.iconOptions = iconOptions

    // Leaflet ikonlarının yolunu ayarla
    if (this.iconOptions.iconPath) {
      L.Icon.Default.imagePath = this.iconOptions.iconPath
    }

    // Initialize DOM elements
    this.modal = document.getElementById(this.elements.modalId)!
    this.mapContainer = document.getElementById(this.elements.mapContainerId)!
    this.closeButton = document.getElementById(this.elements.closeButtonId)!
    this.mapButtons = document.querySelectorAll('.map-ctr-button')

    if (this.elements.mapId) {
      MapInstanceManager.addInstance(this.elements.mapId, this)
    }

    this.bindEvents()
    this.refreshButtons()
  }

  private createCustomMarker(lat: number, lng: number): L.Marker {
    if (this.iconOptions.markerIconUrl) {
      const customIcon = L.icon({
        iconUrl: this.iconOptions.markerIconUrl,
        iconSize: this.iconOptions.markerIconSize || [25, 41],
        iconAnchor: this.iconOptions.markerIconAnchor || [12, 41],
      })
      return L.marker([lat, lng], { icon: customIcon })
    }
    return L.marker([lat, lng])
  }

  private parseCoordinates(
    coordString: string,
  ): { lat: number; lng: number } | null {
    try {
      const [lat, lng] = coordString.split(',').map(Number)
      if (isNaN(lat) || isNaN(lng)) return null
      return { lat, lng }
    } catch {
      return null
    }
  }

  private bindEvents(): void {
    // Map button click events
    this.mapButtons.forEach(button => {
      button.addEventListener('click', e => {
        const coordStr = (e.currentTarget as HTMLElement).getAttribute(
          'data-coordinate',
        )
        if (coordStr) {
          const coordinates = this.parseCoordinates(coordStr)
          if (coordinates) {
            this.openMap(coordinates.lat, coordinates.lng)
          }
        }
      })
    })

    // Close button event
    this.closeButton.addEventListener('click', () => this.closeMap())

    // Outside click handling
    this.modal.addEventListener('click', e => {
      const content = document.getElementById(this.elements.modalContentId)
      if (content && !content.contains(e.target as Node)) {
        this.closeMap()
      }
    })

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (
        this.modal.getAttribute('data-state') === 'open' &&
        e.key === 'Escape'
      ) {
        this.closeMap()
      }
    })
  }

  public openMap(lat: number, lng: number): void {
    this.mapContainer.innerHTML = ''

    const mapDiv = document.createElement('div')
    mapDiv.className = 'w-full h-full'
    this.mapContainer.appendChild(mapDiv)

    try {
      this.map = L.map(mapDiv, {
        zoomControl: false,
        attributionControl: true,
      }).setView([lat, lng], 15)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map)

      // Özel marker oluştur
      if (this.map) {
        this.createCustomMarker(lat, lng).addTo(this.map)
      }

      const zoomControl = L.control.zoom({
        position: 'bottomright',
      })
      zoomControl.addTo(this.map)

      this.modal.setAttribute('data-state', 'open')
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  private closeMap(): void {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
    this.modal.setAttribute('data-state', 'closed')
    this.mapContainer.innerHTML = ''
  }

  public refreshButtons(): void {
    this.mapButtons = document.querySelectorAll('.map-ctr-button')
    this.bindEvents()
  }
}

// Embedded Map Class
class EmbeddedMap {
  private container: HTMLElement
  private config: EmbeddedMapConfig
  private map: L.Map | null = null

  constructor(containerId: string, iconOptions: MapIconOptions = {}) {
    const container = document.getElementById(containerId)
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`)
    }
    this.container = container
    const coordinate = container.getAttribute('data-coordinate')
    if (!coordinate) {
      throw new Error(`Container must have a "data-coordinate" attribute`)
    }
    this.config = {
      containerId,
      coordinate,
      iconOptions,
    }

    if (iconOptions.iconPath) {
      L.Icon.Default.imagePath = iconOptions.iconPath
    }
    this.initialize()
  }

  private createCustomMarker(lat: number, lng: number): L.Marker {
    if (this.config.iconOptions?.markerIconUrl) {
      const customIcon = L.icon({
        iconUrl: this.config.iconOptions.markerIconUrl,
        iconSize: this.config.iconOptions.markerIconSize || [25, 41],
        iconAnchor: this.config.iconOptions.markerIconAnchor || [12, 41],
      })
      return L.marker([lat, lng], { icon: customIcon })
    }
    return L.marker([lat, lng])
  }

  private parseCoordinates(
    coordString: string,
  ): { lat: number; lng: number } | null {
    try {
      const [lat, lng] = coordString.split(',').map(Number)
      if (isNaN(lat) || isNaN(lng)) return null
      return { lat, lng }
    } catch {
      return null
    }
  }

  private initialize(): void {
    const coordinates = this.parseCoordinates(this.config.coordinate)
    if (!coordinates) return

    const mapContainer = this.container.querySelector('.map-container')
    if (!mapContainer) return

    mapContainer.innerHTML = ''

    const mapDiv = document.createElement('div')
    mapDiv.className = 'absolute inset-0 w-full h-full'
    mapContainer.appendChild(mapDiv)

    try {
      this.map = L.map(mapDiv, {
        zoomControl: false,
        attributionControl: true,
      }).setView([coordinates.lat, coordinates.lng], 14)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors',
      }).addTo(this.map)

      // Özel marker'ı ekle
      if (this.map) {
        this.createCustomMarker(coordinates.lat, coordinates.lng).addTo(
          this.map,
        )
      }

      const zoomControl = L.control.zoom({
        position: 'bottomright',
      })
      zoomControl.addTo(this.map)
    } catch (error) {
      console.error('Error initializing map:', error)
    }
  }

  public refresh(): void {
    if (this.map) {
      this.map.remove()
      this.map = null
    }
    this.initialize()
  }
}

export { ModalMap, EmbeddedMap, type MapModalElements, type EmbeddedMapConfig }
