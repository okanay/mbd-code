// Interfaces
interface MapModalElements {
  modalId: string
  modalContentId: string
  mapContainerId: string
  closeButtonId: string
}

interface EmbeddedMapConfig {
  containerId: string
  coordinate: string
}

// Modal Map Class
class ModalMap {
  private modal: HTMLElement
  private mapContainer: HTMLElement
  private closeButton: HTMLElement
  private elements: MapModalElements
  private mapButtons: NodeListOf<Element>
  private apiKey: string

  constructor(apiKey: string, options: Partial<MapModalElements> = {}) {
    this.apiKey = apiKey

    const defaultElements: MapModalElements = {
      modalId: 'map-modal',
      modalContentId: 'map-modal-content',
      mapContainerId: 'map-container',
      closeButtonId: 'close-map-modal',
    }

    this.elements = { ...defaultElements, ...options }

    // Initialize DOM elements
    this.modal = document.getElementById(this.elements.modalId)!
    this.mapContainer = document.getElementById(this.elements.mapContainerId)!
    this.closeButton = document.getElementById(this.elements.closeButtonId)!
    this.mapButtons = document.querySelectorAll('.map-ctr-button')

    this.bindEvents()
  }

  private createMapUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/embed/v1/place?key=${this.apiKey}&q=${lat},${lng}&zoom=15`
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
    const iframe = document.createElement('iframe')
    iframe.src = this.createMapUrl(lat, lng)
    iframe.className = 'w-full h-full border-none'
    iframe.loading = 'lazy'
    iframe.allowFullscreen = true

    this.mapContainer.innerHTML = ''
    this.mapContainer.appendChild(iframe)
    this.modal.setAttribute('data-state', 'open')
  }

  private closeMap(): void {
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
  private apiKey: string
  private config: EmbeddedMapConfig

  constructor(apiKey: string, containerId: string) {
    this.apiKey = apiKey
    this.container = document.getElementById(containerId)!

    if (this.container) {
      const coordinate = this.container.getAttribute('data-coordinate')
      if (coordinate) {
        this.config = {
          containerId,
          coordinate,
        }
        this.initialize()
      }
    }
  }

  private createMapUrl(lat: number, lng: number): string {
    return `https://www.google.com/maps/embed/v1/place?key=${this.apiKey}&q=${lat},${lng}&zoom=14`
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

    // Create and add iframe to the existing map container
    const iframe = document.createElement('iframe')
    iframe.src = this.createMapUrl(coordinates.lat, coordinates.lng)
    iframe.className = 'absolute inset-0 w-full h-full border-none'
    iframe.loading = 'lazy'
    iframe.allowFullscreen = true

    // Find the map container inside our main container
    const mapContainer = this.container.querySelector('.map-container')
    if (mapContainer) {
      mapContainer.innerHTML = ''
      mapContainer.appendChild(iframe)
    }
  }

  public refresh(): void {
    this.initialize()
  }
}

export { ModalMap, EmbeddedMap, type MapModalElements, type EmbeddedMapConfig }
