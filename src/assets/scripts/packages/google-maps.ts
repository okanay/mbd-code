interface MapModalElements {
  modalId: string
  modalContentId: string
  mapContainerId: string
  closeButtonId: string
}

class MapModal {
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

    // Required DOM elements
    this.modal = document.getElementById(this.elements.modalId)!
    this.mapContainer = document.getElementById(this.elements.mapContainerId)!
    this.closeButton = document.getElementById(this.elements.closeButtonId)!

    // Get all map buttons
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
    // Create or update iframe
    const iframe = document.createElement('iframe')
    iframe.src = this.createMapUrl(lat, lng)
    iframe.className = 'w-full h-full border-none'
    iframe.loading = 'lazy'
    iframe.allowFullscreen = true

    // Clear and add new iframe
    this.mapContainer.innerHTML = ''
    this.mapContainer.appendChild(iframe)

    // Open modal
    this.modal.setAttribute('data-state', 'open')
  }

  private closeMap(): void {
    this.modal.setAttribute('data-state', 'closed')
    // Optionally clear iframe when closing
    this.mapContainer.innerHTML = ''
  }

  // Yeni butonlar eklendiğinde çağırın
  public refreshMap(): void {
    this.mapButtons = document.querySelectorAll('.map-ctr-button')
    this.bindEvents()
  }
}

export { MapModal, type MapModalElements }
