interface Point {
  x: number;
  y: number;
}

export function createCarousel(
  listElement: HTMLElement,
  prevButton: HTMLButtonElement,
  nextButton: HTMLButtonElement,
  options: {
    itemsToScroll?: number;
    extraGap?: number;
    threshold?: number;
    snapAlign?: "start" | "center" | "end";
    preventOverscroll?: boolean;
    autoplay?: {
      enabled: boolean;
      delay?: number;
    };
  } = {},
) {
  const {
    itemsToScroll = 1,
    extraGap = 16,
    threshold = 50,
    snapAlign = "start",
    preventOverscroll = true,
    autoplay = { enabled: false, delay: 3000 },
  } = options;

  // Gelişmiş state yönetimi
  const state = {
    startX: 0,
    startY: 0,
    isDragging: false,
    isAnimating: false,
    currentIndex: 0,
    autoplayTimer: null as number | null,
  };

  // Performans ve hassasiyet için gelişmiş scroll hesaplaması
  function calculateScrollMetrics() {
    const items = Array.from(listElement.children) as HTMLElement[];
    const firstItem = items[0];

    // Farklı snap alignment senaryoları için hesaplama
    const scrollAmount =
      snapAlign === "center"
        ? (firstItem.offsetWidth + extraGap) * itemsToScroll -
          listElement.clientWidth / 2
        : (firstItem.offsetWidth + extraGap) * itemsToScroll;

    return {
      itemWidth: firstItem.offsetWidth,
      scrollAmount,
      maxScroll: listElement.scrollWidth - listElement.clientWidth,
    };
  }

  // Gelişmiş dokunmatik gezinme
  function handleTouchInteraction() {
    let startPoint: Point = { x: 0, y: 0 };
    let endPoint: Point = { x: 0, y: 0 };

    function handleStart(e: TouchEvent) {
      const touch = e.touches[0];
      startPoint = { x: touch.clientX, y: touch.clientY };

      // Autoplay'i duraklat
      if (state.autoplayTimer) {
        clearInterval(state.autoplayTimer);
      }
    }

    function handleMove(e: TouchEvent) {
      if (e.touches.length > 1) return; // Çoklu dokunma desteği

      const touch = e.touches[0];
      endPoint = { x: touch.clientX, y: touch.clientY };

      // Dikey ve yatay kaydırma arasındaki farkı hesapla
      const deltaX = startPoint.x - endPoint.x;
      const deltaY = Math.abs(startPoint.y - endPoint.y);

      // Yatay kaydırmayı tercih et
      if (Math.abs(deltaX) > deltaY) {
        e.preventDefault(); // Dikey kaydırmayı engelle
      }
    }

    function handleEnd(e: TouchEvent) {
      const touch = e.changedTouches[0];
      endPoint = { x: touch.clientX, y: touch.clientY };

      const deltaX = startPoint.x - endPoint.x;

      // Gelişmiş eşik kontrolü
      if (Math.abs(deltaX) > threshold) {
        deltaX > 0 ? scrollNext() : scrollPrev();
      }

      // Autoplay'i yeniden başlat
      startAutoplay();
    }

    return { handleStart, handleMove, handleEnd };
  }

  // Gelişmiş scroll fonksiyonu
  function safeScroll(amount: number) {
    if (state.isAnimating) return;

    const { scrollAmount, maxScroll } = calculateScrollMetrics();
    const currentScroll = listElement.scrollLeft;

    state.isAnimating = true;

    // Overscroll önleme
    const newScrollPosition = preventOverscroll
      ? Math.min(Math.max(0, currentScroll + amount), maxScroll)
      : currentScroll + amount;

    listElement.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });

    requestAnimationFrame(() => {
      setTimeout(() => {
        state.isAnimating = false;
        updateButtonStates();
      }, 300);
    });
  }

  // Otomatik oynatma
  function startAutoplay() {
    if (!autoplay.enabled) return;

    if (state.autoplayTimer) {
      clearInterval(state.autoplayTimer);
    }

    state.autoplayTimer = window.setInterval(() => {
      scrollNext();
    }, autoplay.delay);
  }

  // Button state güncelleme
  function updateButtonStates() {
    const { maxScroll } = calculateScrollMetrics();
    const scrollPosition = listElement.scrollLeft;

    prevButton.disabled = scrollPosition <= 0;
    nextButton.disabled = scrollPosition >= maxScroll;
  }

  // Touch event yöneticisi
  const touchHandler = handleTouchInteraction();

  // Event listener'ları ekle
  listElement.addEventListener("touchstart", touchHandler.handleStart);
  listElement.addEventListener("touchmove", touchHandler.handleMove);
  listElement.addEventListener("touchend", touchHandler.handleEnd);

  prevButton.addEventListener("click", scrollPrev);
  nextButton.addEventListener("click", scrollNext);

  // Metodlar
  function scrollNext() {
    const { scrollAmount } = calculateScrollMetrics();
    safeScroll(scrollAmount);
  }

  function scrollPrev() {
    const { scrollAmount } = calculateScrollMetrics();
    safeScroll(-scrollAmount);
  }

  // İlk durumu ayarla
  updateButtonStates();
  startAutoplay();

  return {
    scrollNext,
    scrollPrev,
    updateButtonStates,
    startAutoplay,
  };
}
