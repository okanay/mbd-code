interface CarouselOptions {
  snapAlign?: "start" | "center" | "end";
  itemSpacing?: number;
  screenSizes?: { width: number; jumpVal: number }[];
  momentumScroll?: boolean;
  onScrollCallback?: (currentIndex: number, totalItems: number) => void;
}

function CreateCarousel(
  carouselList: HTMLElement,
  options: CarouselOptions = {},
) {
  const {
    snapAlign = "start",
    itemSpacing = 16,
    screenSizes = [
      { width: 1024, jumpVal: 3 },
      { width: 768, jumpVal: 2 },
      { width: 512, jumpVal: 1 },
    ],
    momentumScroll = true,
    onScrollCallback,
  } = options;

  const items = Array.from(carouselList.children) as HTMLElement[];
  const state = {
    currentIndex: 0,
    isScrolling: false,
  };

  // Ekran genişliğine göre kaç item ilerleyeceğini hesapla
  function getItemsPerPage(): number {
    const width = window.innerWidth;
    const sortedSizes = [...screenSizes].sort((a, b) => b.width - a.width);

    for (const size of sortedSizes) {
      if (width >= size.width) return size.jumpVal;
    }

    return sortedSizes[sortedSizes.length - 1].jumpVal;
  }

  // Scroll pozisyonunu hassas şekilde hesapla
  function calculatePreciseScroll(targetIndex: number): number {
    let scrollPosition = 0;

    for (let i = 0; i < targetIndex; i++) {
      scrollPosition += items[i].getBoundingClientRect().width + itemSpacing;
    }

    const containerWidth = carouselList.clientWidth;
    const targetItemWidth =
      items[targetIndex]?.getBoundingClientRect().width || 0;

    if (snapAlign === "center") {
      scrollPosition -= containerWidth / 2 - targetItemWidth / 2;
    } else if (snapAlign === "end") {
      scrollPosition -= containerWidth - targetItemWidth;
    }

    return scrollPosition;
  }

  // Belirtilen index'e scroll yap
  function scrollToIndex(index: number): void {
    if (state.isScrolling || index < 0 || index >= items.length) return;

    state.isScrolling = true;
    state.currentIndex = index;

    const scrollPosition = calculatePreciseScroll(index);

    carouselList.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    setTimeout(() => {
      state.isScrolling = false;
      if (onScrollCallback) onScrollCallback(state.currentIndex, items.length);
    }, 300);
  }

  // Dokunmatik etkileşimleri yönet
  function setupTouchInteraction(): void {
    let startX = 0;
    let isDragging = false;

    carouselList.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    });

    carouselList.addEventListener("touchmove", (e) => {
      if (!isDragging) return;
      e.preventDefault(); // Dikey kaydırmayı engelle
    });

    carouselList.addEventListener("touchend", (e) => {
      if (!isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      const swipeThreshold = calculateSwipeThreshold();
      const newIndex =
        diffX > swipeThreshold
          ? Math.min(state.currentIndex + getItemsPerPage(), items.length - 1)
          : diffX < -swipeThreshold
            ? Math.max(state.currentIndex - getItemsPerPage(), 0)
            : state.currentIndex;

      scrollToIndex(newIndex);
      isDragging = false;
    });
  }

  // Momentum scroll özelliği
  function setupMomentumScroll(): void {
    let startX = 0;
    let velocityX = 0;
    let lastTime = 0;

    carouselList.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      velocityX = 0;
      lastTime = Date.now();
    });

    carouselList.addEventListener("touchmove", (e) => {
      const currentX = e.touches[0].clientX;
      const currentTime = Date.now();
      velocityX = (currentX - startX) / (currentTime - lastTime);

      startX = currentX;
      lastTime = currentTime;
    });

    carouselList.addEventListener("touchend", () => {
      if (momentumScroll && Math.abs(velocityX) > 0.1) {
        const momentumDistance = velocityX * 200; // Momentum katsayısı
        carouselList.scrollBy({
          left: momentumDistance,
          behavior: "smooth",
        });
      }
    });
  }

  // Swipe hassasiyetini hesapla
  function calculateSwipeThreshold(): number {
    const averageWidth =
      items.reduce((sum, item) => sum + item.getBoundingClientRect().width, 0) /
      items.length;
    return averageWidth / 4;
  }

  // Navigation butonlarını bağla
  function setupNavigationButtons(
    prevButton: HTMLButtonElement,
    nextButton: HTMLButtonElement,
  ): void {
    prevButton.addEventListener("click", () => {
      scrollToIndex(Math.max(state.currentIndex - getItemsPerPage(), 0));
    });

    nextButton.addEventListener("click", () => {
      scrollToIndex(
        Math.min(state.currentIndex + getItemsPerPage(), items.length - 1),
      );
    });
  }

  // Başlatıcı fonksiyonlar
  setupTouchInteraction();
  if (momentumScroll) setupMomentumScroll();

  return {
    scrollToIndex,
    setupNavigationButtons,
    getCurrentState: () => ({
      currentIndex: state.currentIndex,
      totalItems: items.length,
    }),
  };
}

function SetupCarousel(
  listId: string,
  prevBtnId: string,
  nextBtnId: string,
  options: {
    snapAlign?: "start" | "center" | "end";
    itemSpacing?: number;
    screenSizes?: { width: number; jumpVal: number }[];
  } = {},
) {
  const carouselElement = document.getElementById(listId) as HTMLElement | null;
  const prevButton = document.getElementById(
    prevBtnId,
  ) as HTMLButtonElement | null;
  const nextButton = document.getElementById(
    nextBtnId,
  ) as HTMLButtonElement | null;

  if (!carouselElement || !prevButton || !nextButton) {
    console.warn(
      `Carousel setup failed: Missing element(s) for ${listId}, ${prevBtnId}, or ${nextBtnId}.`,
    );
    return null;
  }

  // Carousel oluştur ve butonları bağla
  const carousel = CreateCarousel(carouselElement, options);
  carousel.setupNavigationButtons(prevButton, nextButton);

  return carousel;
}

export { SetupCarousel, CreateCarousel };
