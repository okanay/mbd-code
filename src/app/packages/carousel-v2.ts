interface CarouselOptions {
  snapAlign?: "start" | "center" | "end";
  itemSpacing?: number;
  screenSizes?: { width: number; jumpVal: number }[];
}

export class Carousel {
  private carouselList: HTMLElement;
  private items: HTMLElement[];
  private options: Required<CarouselOptions>;
  private state: {
    currentIndex: number;
    isScrolling: boolean;
  };
  private prevButton: HTMLButtonElement;
  private nextButton: HTMLButtonElement;

  constructor(
    listId: string,
    prevButtonId: string,
    nextButtonId: string,
    options: CarouselOptions = {},
  ) {
    // Element selections
    const list = document.getElementById(listId) as HTMLElement;
    const prevBtn = document.getElementById(prevButtonId) as HTMLButtonElement;
    const nextBtn = document.getElementById(nextButtonId) as HTMLButtonElement;

    if (!list || !prevBtn || !nextBtn) {
      throw new Error(`Carousel setup failed for ${listId}. Missing elements.`);
    }

    this.carouselList = list;
    this.prevButton = prevBtn;
    this.nextButton = nextBtn;

    // Initialize options with defaults
    this.options = {
      snapAlign: options.snapAlign ?? "center",
      itemSpacing: options.itemSpacing ?? 16,
      screenSizes: options.screenSizes ?? [
        { width: 1024, jumpVal: 3 },
        { width: 768, jumpVal: 2 },
        { width: 512, jumpVal: 1 },
      ],
    };

    // Initialize state
    this.state = {
      currentIndex: 0,
      isScrolling: false,
    };

    // Get carousel items
    this.items = Array.from(this.carouselList.children) as HTMLElement[];

    // Setup event listeners
    this.setupNavigationButtons();
    this.setupMomentumScroll();
    this.setupTouchInteraction();
  }

  private getItemsPerPage(): number {
    const width = window.innerWidth;
    const sortedSizes = [...this.options.screenSizes].sort(
      (a, b) => b.width - a.width,
    );

    for (let i = 0; i < sortedSizes.length; i++) {
      if (width >= sortedSizes[i].width) {
        return sortedSizes[i].jumpVal;
      }
    }

    return sortedSizes[sortedSizes.length - 1].jumpVal;
  }

  private calculateMetrics() {
    const containerWidth = this.carouselList.clientWidth;

    const itemWidths = this.items.map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.width;
    });

    const averageItemWidth =
      itemWidths.reduce((a, b) => a + b, 0) / itemWidths.length;

    return {
      containerWidth,
      itemWidths,
      averageItemWidth,
      totalWidth: this.items.reduce((total, item) => {
        const rect = item.getBoundingClientRect();
        return total + rect.width + this.options.itemSpacing;
      }, 0),
    };
  }

  private calculatePreciseScroll(targetIndex: number): number {
    const metrics = this.calculateMetrics();
    let scrollPosition = 0;

    for (let i = 0; i < targetIndex; i++) {
      scrollPosition +=
        this.items[i].getBoundingClientRect().width + this.options.itemSpacing;
    }

    switch (this.options.snapAlign) {
      case "center":
        scrollPosition -=
          metrics.containerWidth / 2 - metrics.itemWidths[targetIndex] / 2;
        break;
      case "end":
        scrollPosition -=
          metrics.containerWidth - metrics.itemWidths[targetIndex];
        break;
    }

    return scrollPosition;
  }

  private scrollToPrecise(index: number): void {
    if (this.state.isScrolling || index < 0 || index >= this.items.length)
      return;

    this.state.isScrolling = true;
    this.state.currentIndex = index;

    const scrollPosition = this.calculatePreciseScroll(index);

    this.carouselList.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    setTimeout(() => {
      this.state.isScrolling = false;
    }, 300);
  }

  private setupTouchInteraction(): void {
    let startX = 0;
    let isDragging = false;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      e.preventDefault();
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isDragging) return;

      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      const metrics = this.calculateMetrics();
      const swipeThreshold = metrics.averageItemWidth / 4;

      if (Math.abs(diffX) > swipeThreshold) {
        const newIndex =
          diffX > 0
            ? Math.min(
                this.state.currentIndex + this.getItemsPerPage(),
                this.items.length - 1,
              )
            : Math.max(this.state.currentIndex - this.getItemsPerPage(), 0);

        this.scrollToPrecise(newIndex);
      }

      isDragging = false;
    };

    this.carouselList.addEventListener("touchstart", handleTouchStart);
    this.carouselList.addEventListener("touchmove", handleTouchMove);
    this.carouselList.addEventListener("touchend", handleTouchEnd);
  }

  private setupNavigationButtons(): void {
    this.prevButton.addEventListener("click", () => {
      this.scrollToPrecise(
        Math.max(this.state.currentIndex - this.getItemsPerPage(), 0),
      );
    });

    this.nextButton.addEventListener("click", () => {
      this.scrollToPrecise(
        Math.min(
          this.state.currentIndex + this.getItemsPerPage(),
          this.items.length - 1,
        ),
      );
    });
  }

  private setupMomentumScroll(): void {
    let startX = 0;
    let startTime = 0;
    let velocityX = 0;

    this.carouselList.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startTime = Date.now();
      velocityX = 0;
    });

    this.carouselList.addEventListener("touchmove", (e) => {
      const currentX = e.touches[0].clientX;
      const currentTime = Date.now();

      velocityX = (currentX - startX) / (currentTime - startTime);

      startX = currentX;
      startTime = currentTime;
    });

    this.carouselList.addEventListener("touchend", () => {
      if (Math.abs(velocityX) > 0.1) {
        const momentumDistance = velocityX * 100;
        this.carouselList.scrollBy({
          left: momentumDistance,
          behavior: "smooth",
        });
      }
    });
  }

  // Public methods
  public scrollTo(index: number): void {
    this.scrollToPrecise(index);
  }

  public getCurrentState() {
    return {
      currentIndex: this.state.currentIndex,
      totalItems: this.items.length,
      ...this.calculateMetrics(),
    };
  }
}
