export function createCarousel(
  carouselList: HTMLElement,
  options: {
    snapAlign?: "start" | "center" | "end";
    itemSpacing?: number;
    screenSizes?: { width: number; jumpVal: number }[];
  } = {},
) {
  const {
    snapAlign = "start",
    itemSpacing = 16,
    screenSizes = [{ width: 0, jumpVal: 1 }],
  } = options;

  console.log("Carousel created with options:", options);

  // Carousel elemanlarını al
  const items = Array.from(carouselList.children) as HTMLElement[];

  // Scroll state'i
  const state = {
    currentIndex: 0,
    isScrolling: false,
  };

  // Ekran genişliğine göre item sayısını belirle
  function getItemsPerPage() {
    const width = window.innerWidth;

    // Genişlik sıralamasını yap (Büyükten küçüğe doğru)
    const sortedSizes = [...screenSizes].sort((a, b) => b.width - a.width);

    // Genişlik sırasına göre eşleşme kontrolü
    for (let i = 0; i < sortedSizes.length; i++) {
      if (width >= sortedSizes[i].width) {
        return sortedSizes[i].jumpVal;
      }
    }

    // Eğer ekran genişliği en küçük değerden de küçükse
    return sortedSizes[sortedSizes.length - 1].jumpVal;
  }

  // Ekran genişliğini ve item boyutlarını hesapla
  function calculateMetrics() {
    const containerWidth = carouselList.clientWidth;
    const firstItem = items[0];

    const itemWidths = items.map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.width;
    });

    const averageItemWidth =
      itemWidths.reduce((a, b) => a + b, 0) / itemWidths.length;

    return {
      containerWidth,
      itemWidths,
      averageItemWidth,
      totalWidth: items.reduce((total, item) => {
        const rect = item.getBoundingClientRect();
        return total + rect.width + itemSpacing;
      }, 0),
    };
  }

  // Hassas scroll hesaplama
  function calculatePreciseScroll(targetIndex: number) {
    const metrics = calculateMetrics();
    let scrollPosition = 0;

    // Farklı snap alignment senaryoları
    for (let i = 0; i < targetIndex; i++) {
      scrollPosition += items[i].getBoundingClientRect().width + itemSpacing;
    }

    // Align ayarlamaları
    switch (snapAlign) {
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

  // Scroll fonksiyonu
  function scrollToPrecise(index: number) {
    if (state.isScrolling || index < 0 || index >= items.length) return;
    console.log("Scrolling to index:", index);

    state.isScrolling = true;
    state.currentIndex = index;

    const scrollPosition = calculatePreciseScroll(index);

    carouselList.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });

    // Scroll tamamlandığında state'i sıfırla
    setTimeout(() => {
      state.isScrolling = false;
    }, 300);
  }

  // Dokunmatik etkileşim yönetimi
  function setupTouchInteraction() {
    let startX = 0;
    let isDragging = false;

    function handleTouchStart(e: TouchEvent) {
      startX = e.touches[0].clientX;
      isDragging = true;
    }

    function handleTouchMove(e: TouchEvent) {
      if (!isDragging) return;
      e.preventDefault(); // Varsayılan kaydırmayı engelle
    }

    function handleTouchEnd(e: TouchEvent) {
      if (!isDragging) return;

      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;

      const metrics = calculateMetrics();
      const swipeThreshold = metrics.averageItemWidth / 2;

      if (Math.abs(diffX) > swipeThreshold) {
        const newIndex =
          diffX > 0
            ? Math.min(state.currentIndex + 1, items.length - 1)
            : Math.max(state.currentIndex - 1, 0);

        scrollToPrecise(newIndex);
      }

      isDragging = false;
    }

    carouselList.addEventListener("touchstart", handleTouchStart);
    carouselList.addEventListener("touchmove", handleTouchMove);
    carouselList.addEventListener("touchend", handleTouchEnd);
  }

  // Navigation butonları için destek
  function setupNavigationButtons(
    prevButton: HTMLButtonElement,
    nextButton: HTMLButtonElement,
  ) {
    prevButton.addEventListener("click", () => {
      scrollToPrecise(Math.max(state.currentIndex - getItemsPerPage(), 0));
    });

    nextButton.addEventListener("click", () => {
      scrollToPrecise(
        Math.min(state.currentIndex + getItemsPerPage(), items.length - 1),
      );
    });
  }

  // Hesaplama metodları ve state'i dışarı ver
  function getCurrentState() {
    return {
      currentIndex: state.currentIndex,
      totalItems: items.length,
      ...calculateMetrics(),
    };
  }

  // Hassas scroll modu için optimizasyon
  function setupMomentumScroll(carouselList: HTMLElement) {
    let startX = 0;
    let startTime = 0;
    let velocityX = 0;

    carouselList.addEventListener("touchstart", (e) => {
      startX = e.touches[0].clientX;
      startTime = Date.now();
      velocityX = 0;
    });

    carouselList.addEventListener("touchmove", (e) => {
      const currentX = e.touches[0].clientX;
      const currentTime = Date.now();

      // Calculate velocity
      velocityX = (currentX - startX) / (currentTime - startTime);

      startX = currentX;
      startTime = currentTime;
    });

    carouselList.addEventListener("touchend", () => {
      // Apply momentum scroll
      if (Math.abs(velocityX) > 0.1) {
        const momentumDistance = velocityX * 100; // Adjust multiplier for desired effect
        carouselList.scrollBy({
          left: momentumDistance,
          behavior: "smooth",
        });
      }
    });
  }

  // Touch etkileşimini başlat
  // enhanceCarouselPerformance(carouselList);
  setupMomentumScroll(carouselList);
  setupTouchInteraction();

  return {
    scrollTo: scrollToPrecise,
    getCurrentState,
    setupNavigationButtons,
  };
}

function enhanceCarouselPerformance(carouselElement: HTMLElement) {
  // Mobil cihazlar için touch event optimizasyonu
  let startX = 0;
  let isDragging = false;

  carouselElement.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    // Momentum scrolling için gerekli hazırlık
    carouselElement.style.scrollSnapType = "x mandatory";
  });

  carouselElement.addEventListener("touchmove", (e) => {
    if (!isDragging) return;

    // Dikey kaydırmayı engelle
    e.preventDefault();

    const currentX = e.touches[0].clientX;
    const diffX = startX - currentX;

    // Hassas scroll kontrolü
    carouselElement.scrollLeft += diffX;
    startX = currentX;
  });

  carouselElement.addEventListener("touchend", () => {
    isDragging = false;
    // Scroll snap ayarını geri al
    carouselElement.style.scrollSnapType = "none";
  });
}
