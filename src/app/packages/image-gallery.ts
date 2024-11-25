class ImageGalleryTracker {
  private modal: HTMLElement;
  private mainImageContainer: HTMLElement;
  private thumbnailsContainer: HTMLElement;
  private sourceContainer: HTMLElement;
  private images: {
    src: string;
    dataSrc: string;
    alt: string;
    index: number;
  }[] = [];
  private currentIndex: number = 0;
  private dataSrcAttribute: string;
  private thumbnailClass: string;
  private activeThumbnailClass: string;
  private sourceImageSelector: string;

  constructor(
    modalId: string = "gallery-modal",
    mainImageContainerId: string = "gallery-modal-main-image-container",
    thumbnailsContainerId: string = "gallery-modal-thumbnails",
    sourceContainerId: string = "product-slider",
    dataSrcAttribute: string = "data-src",
    thumbnailClass: string = "thumbnail",
    activeThumbnailClass: string = "thumbnail-active",
    sourceImageSelector: string = ".product-slide img",
  ) {
    // Initialize DOM elements
    this.modal = document.getElementById(modalId)!;
    this.mainImageContainer = document.getElementById(mainImageContainerId)!;
    this.thumbnailsContainer = document.getElementById(thumbnailsContainerId)!;
    this.sourceContainer = document.getElementById(sourceContainerId)!;
    this.dataSrcAttribute = dataSrcAttribute;
    this.thumbnailClass = thumbnailClass;
    this.activeThumbnailClass = activeThumbnailClass;
    this.sourceImageSelector = sourceImageSelector;

    // Initial setup
    this.initializeGallery();
    this.bindEvents();
  }

  private initializeGallery(): void {
    // Get all images from source container
    const sourceImages = this.sourceContainer.querySelectorAll(
      this.sourceImageSelector,
    );

    // Store image data
    this.images = Array.from(sourceImages).map((img, index) => {
      const image = img as HTMLImageElement;
      return {
        src: image.getAttribute(this.dataSrcAttribute) || image.src,
        dataSrc: image.getAttribute(this.dataSrcAttribute) || "",
        alt: image.alt,
        index: index,
      };
    });

    // Initial render of thumbnails
    this.renderThumbnails();
  }

  private bindEvents(): void {
    // Source container click event
    this.sourceContainer.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      const slide = target.closest(".product-slide");

      if (slide) {
        const index = parseInt(slide.getAttribute("data-index") || "0");
        this.openGallery(index);
      }
    });

    // Thumbnail click event
    this.thumbnailsContainer.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "IMG") {
        const index = Array.from(this.thumbnailsContainer.children).indexOf(
          target,
        );
        this.updateMainImage(index);
      }
    });

    // Arrow key navigation
    document.addEventListener("keydown", (e) => {
      if (this.modal.getAttribute("data-state") === "open") {
        if (e.key === "ArrowRight") {
          this.navigateGallery("next");
        } else if (e.key === "ArrowLeft") {
          this.navigateGallery("prev");
        }
      }
    });
  }

  public openGallery(index: number): void {
    this.currentIndex = index;
    this.updateMainImage(index);
  }

  private updateMainImage(index: number): void {
    this.currentIndex = index;
    const mainImage = this.mainImageContainer.querySelector("img");
    if (mainImage && this.images[index]) {
      mainImage.src = this.images[index].src;
      mainImage.alt = this.images[index].alt;
    }
    this.updateThumbnailStates();
  }

  private renderThumbnails(): void {
    this.thumbnailsContainer.innerHTML = this.images
      .map(
        (img, index) => `
        <img
          src="${img.src}"
          alt="${img.alt}"
          class="${this.thumbnailClass} ${
            index === this.currentIndex ? this.activeThumbnailClass : ""
          }"
        />
      `,
      )
      .join("");
  }

  private updateThumbnailStates(): void {
    const thumbnails = this.thumbnailsContainer.querySelectorAll("img");
    thumbnails.forEach((thumb, index) => {
      if (index === this.currentIndex) {
        thumb.classList.add(this.activeThumbnailClass);
      } else {
        thumb.classList.remove(this.activeThumbnailClass);
      }
    });
  }

  private navigateGallery(direction: "next" | "prev"): void {
    const totalImages = this.images.length;
    let newIndex = this.currentIndex;

    if (direction === "next") {
      newIndex = (this.currentIndex + 1) % totalImages;
    } else {
      newIndex = (this.currentIndex - 1 + totalImages) % totalImages;
    }

    this.updateMainImage(newIndex);
  }

  // Public method to manually refresh gallery (useful for dynamic content)
  public refreshGallery(): void {
    this.initializeGallery();
  }
}

function UpdateProductSliderDataItems(
  sliderId: string,
  options: { min: number; max: number; dataItems: string },
) {
  const productSlider = document.getElementById(sliderId);
  if (productSlider) {
    const childElements = productSlider.children.length;
    const dataItems = productSlider.getAttribute("data-items");

    if (dataItems === options.dataItems) {
      const newItemsValue = Math.max(
        options.min,
        Math.min(childElements, options.max),
      );
      productSlider.setAttribute("data-items", newItemsValue.toString());
    }
  }
}

export { ImageGalleryTracker, UpdateProductSliderDataItems };
