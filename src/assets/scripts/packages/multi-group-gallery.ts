interface GalleryElements {
  modalId: string
  modalContentId: string
  mainImageContainerId: string
  thumbnailsContainerId: string
  prevButtonId: string
  nextButtonId: string
  closeButtonId: string
}

interface GalleryGroup {
  containerId: string
  slideItemClass: string
}

interface GalleryOptions {
  elements?: Partial<GalleryElements>
  groups: GalleryGroup[]
  thumbnailClass?: string
  activeThumbnailClass?: string
  onImageCount?: (groupId: string, count: number) => void
}

class MultiGroupImageGallery {
  private modal: HTMLElement
  private mainImageContainer: HTMLElement
  private thumbnailsContainer: HTMLElement
  private prevButton: HTMLElement
  private nextButton: HTMLElement
  private closeButton: HTMLElement
  private elements: GalleryElements

  private groups: Map<
    string,
    Array<{
      src: string
      alt: string
      index: number
    }>
  > = new Map()

  private groupConfigs: GalleryGroup[]
  private currentGroup: string | null = null
  private currentIndex: number = 0
  private thumbnailClass: string
  private activeThumbnailClass: string

  private onImageCountCallback?: (groupId: string, count: number) => void

  constructor(options: GalleryOptions) {
    const defaultElements: GalleryElements = {
      modalId: 'gallery-modal',
      modalContentId: 'gallery-modal-content',
      mainImageContainerId: 'gallery-modal-main-image-container',
      thumbnailsContainerId: 'gallery-modal-thumbnails',
      prevButtonId: 'prev-image-gallery',
      nextButtonId: 'next-image-gallery',
      closeButtonId: 'close-image-gallery',
    }

    this.elements = { ...defaultElements, ...options.elements }

    // Required DOM elements
    this.modal = document.getElementById(this.elements.modalId)!
    this.mainImageContainer = document.getElementById(
      this.elements.mainImageContainerId,
    )!
    this.thumbnailsContainer = document.getElementById(
      this.elements.thumbnailsContainerId,
    )!
    this.prevButton = document.getElementById(this.elements.prevButtonId)!
    this.nextButton = document.getElementById(this.elements.nextButtonId)!
    this.closeButton = document.getElementById(this.elements.closeButtonId)!

    // Group configurations
    this.groupConfigs = options.groups

    // Other options
    this.thumbnailClass = options.thumbnailClass || 'thumbnail'
    this.activeThumbnailClass =
      options.activeThumbnailClass || 'thumbnail-active'
    this.onImageCountCallback = options.onImageCount

    this.initializeGallery()
    this.bindEvents()
  }

  private initializeGroup(groupId: string): void {
    const groupConfig = this.groupConfigs.find(g => g.containerId === groupId)
    if (!groupConfig) return

    const container = document.getElementById(groupConfig.containerId)
    if (!container) return

    const slideItems = container.getElementsByClassName(
      groupConfig.slideItemClass,
    )
    const images = Array.from(slideItems)
      .map((item, index) => {
        const image = item.querySelector('img') as HTMLImageElement
        if (!image) return null

        const imageSrc = this.getImageSource(image)
        // Geçerli bir kaynak yoksa null döndür
        if (!imageSrc || imageSrc === '#') return null

        return {
          src: imageSrc,
          alt: image.alt,
          index: index,
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    this.groups.set(groupConfig.containerId, images)

    if (this.onImageCountCallback) {
      this.onImageCountCallback(groupConfig.containerId, images.length)
    }
  }

  private getImageSource(imageElement: HTMLImageElement): string {
    // Önce data-src'yi kontrol et, yoksa src'yi kullan
    const dataSrc = imageElement.getAttribute('data-src')
    if (dataSrc && dataSrc !== '#' && dataSrc !== '') {
      return dataSrc
    }
    return imageElement.src
  }

  private initializeGallery(): void {
    // Tüm grupları başlangıçta initialize et
    this.groupConfigs.forEach(group => {
      this.initializeGroup(group.containerId)
    })
  }

  private bindEvents(): void {
    // Grup containerları için click eventi
    this.groupConfigs.forEach(group => {
      const container = document.getElementById(group.containerId)
      if (!container) return

      container.addEventListener('click', e => {
        const target = e.target as HTMLElement
        const slideItem = target.closest(`.${group.slideItemClass}`)

        if (slideItem) {
          const index = parseInt(slideItem.getAttribute('data-index') || '0')
          this.openGallery(group.containerId, index)
        }
      })
    })

    // Thumbnail click event
    this.thumbnailsContainer.addEventListener('click', e => {
      const target = e.target as HTMLElement
      if (target.tagName === 'IMG') {
        const index = Array.from(this.thumbnailsContainer.children).indexOf(
          target,
        )
        this.updateMainImage(index)
      }
    })

    // Navigation
    this.prevButton.addEventListener('click', () =>
      this.navigateGallery('prev'),
    )
    this.nextButton.addEventListener('click', () =>
      this.navigateGallery('next'),
    )
    this.closeButton.addEventListener('click', () => this.closeGallery())

    // Outside click handling
    this.modal.addEventListener('click', e => {
      const target = e.target as HTMLElement
      const content = document.getElementById(this.elements.modalContentId)

      if (
        content &&
        !content.contains(target) &&
        this.modal.getAttribute('data-state') === 'open'
      ) {
        this.closeGallery()
      }
    })

    // Keyboard navigation
    document.addEventListener('keydown', e => {
      if (this.modal.getAttribute('data-state') === 'open') {
        if (e.key === 'ArrowRight') {
          this.navigateGallery('next')
        } else if (e.key === 'ArrowLeft') {
          this.navigateGallery('prev')
        } else if (e.key === 'Escape') {
          this.closeGallery()
        }
      }
    })
  }

  public openGallery(groupId: string, index: number): void {
    // Galeri açılmadan önce grubu yeniden initialize et
    this.initializeGroup(groupId)

    this.currentGroup = groupId
    this.currentIndex = index
    this.modal.setAttribute('data-state', 'open')
    this.updateMainImage(index)
    this.renderThumbnails()
  }

  private closeGallery(): void {
    this.modal.setAttribute('data-state', 'closed')
    this.currentGroup = null
    this.currentIndex = 0
  }

  private updateMainImage(index: number): void {
    if (!this.currentGroup) return

    const images = this.groups.get(this.currentGroup)
    if (!images) return

    this.currentIndex = index
    const mainImage = this.mainImageContainer.querySelector('img')
    if (mainImage && images[index]) {
      // Ana görsel için de loading="eager" ekleyelim
      mainImage.setAttribute('loading', 'eager')
      mainImage.src = images[index].src
      mainImage.alt = images[index].alt
    }

    this.updateThumbnailStates()
  }

  private renderThumbnails(): void {
    if (!this.currentGroup) return

    const images = this.groups.get(this.currentGroup)
    if (!images) return

    // Thumbnail'ler için loading="eager" ekleyelim
    this.thumbnailsContainer.innerHTML = images
      .map(
        (img, index) => `
          <img
            src="${img.src}"
            alt="${img.alt}"
            loading="eager"
            class="${this.thumbnailClass} ${index === this.currentIndex ? this.activeThumbnailClass : ''}"
          />
        `,
      )
      .join('')
  }

  private updateThumbnailStates(): void {
    const thumbnails = this.thumbnailsContainer.querySelectorAll('img')
    thumbnails.forEach((thumb, index) => {
      if (index === this.currentIndex) {
        thumb.classList.add(this.activeThumbnailClass)
        this.scrollToActiveThumbnail(thumb)
      } else {
        thumb.classList.remove(this.activeThumbnailClass)
      }
    })
  }

  private scrollToActiveThumbnail(activeThumbnail: Element): void {
    const container = this.thumbnailsContainer
    const thumbLeft = activeThumbnail.getBoundingClientRect().left
    const containerLeft = container.getBoundingClientRect().left
    const scrollLeft = container.scrollLeft
    const thumbnailWidth = activeThumbnail.clientWidth
    const containerWidth = container.clientWidth

    const offsetLeft =
      thumbLeft -
      containerLeft +
      scrollLeft -
      containerWidth / 2 +
      thumbnailWidth / 2

    container.scrollTo({
      left: offsetLeft,
      behavior: 'smooth',
    })
  }

  public navigateGallery(direction: 'next' | 'prev'): void {
    if (!this.currentGroup) return

    const images = this.groups.get(this.currentGroup)
    if (!images) return

    const totalImages = images.length
    let newIndex = this.currentIndex

    if (direction === 'next') {
      newIndex = (this.currentIndex + 1) % totalImages
    } else {
      newIndex = (this.currentIndex - 1 + totalImages) % totalImages
    }

    this.updateMainImage(newIndex)
  }

  public refreshGallery(): void {
    this.groups.clear()
    this.initializeGallery()
  }
}

function UpdateProductSliderDataItems(
  sliderId: string,
  options: {
    min: number
    max: number
    childElements: number
    dataItems: string
  },
) {
  const productSlider = document.getElementById(sliderId)
  if (productSlider) {
    const dataItems = productSlider.getAttribute('data-items')

    if (dataItems === options.dataItems) {
      const newItemsValue = Math.max(
        options.min,
        Math.min(options.childElements, options.max),
      )
      productSlider.setAttribute('data-items', newItemsValue.toString())
    }
  }
}

function UpdateElementInnerHTMLById(elementId: string, newValue: string): void {
  const element = document.getElementById(elementId)
  if (element) {
    element.innerHTML = newValue
  }
}

export {
  MultiGroupImageGallery,
  UpdateProductSliderDataItems,
  UpdateElementInnerHTMLById,
  type GalleryOptions,
  type GalleryElements,
  type GalleryGroup,
}
