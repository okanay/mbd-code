function debounce(func: Function, wait: number = 200) {
  let timeout: number;
  return function (this: any, ...args: any[]) {
    const context = this;
    clearTimeout(timeout);
    timeout = window.setTimeout(() => {
      func.apply(context, args);
    }, wait);
  };
}

export function createCarousel(
  listElement: HTMLElement,
  prevButton: HTMLButtonElement,
  nextButton: HTMLButtonElement,
  options: {
    itemsToScroll?: number;
    extraGap?: number;
    threshold?: number;
  } = {},
) {
  const {
    itemsToScroll = 1,
    extraGap = 16,
    threshold = 50, // Swipe threshold
  } = options;

  let startX = 0;
  let isDragging = false;
  let isAnimating = false;

  function getScrollAmount() {
    const firstItem = listElement.children[0] as HTMLElement;
    return (firstItem.offsetWidth + extraGap) * itemsToScroll;
  }

  function updateButtonStates() {
    const scrollPosition = listElement.scrollLeft;
    const maxScroll = listElement.scrollWidth - listElement.clientWidth;

    prevButton.disabled = scrollPosition <= 0;
    nextButton.disabled = scrollPosition >= maxScroll;
  }

  const safeScroll = (amount: number) => {
    if (isAnimating) return;

    isAnimating = true;
    const maxScroll = listElement.scrollWidth - listElement.clientWidth;
    const currentScroll = listElement.scrollLeft;
    const newScrollPosition = Math.min(
      Math.max(0, currentScroll + amount),
      maxScroll,
    );

    listElement.scrollTo({
      left: newScrollPosition,
      behavior: "smooth",
    });

    requestAnimationFrame(() => {
      setTimeout(() => {
        isAnimating = false;
        updateButtonStates();
      }, 300);
    });
  };

  // Touch Event Handlers
  function handleTouchStart(e: TouchEvent) {
    startX = e.touches[0].clientX;
    isDragging = true;
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling
  }

  function handleTouchEnd(e: TouchEvent) {
    if (!isDragging) return;

    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;

    if (Math.abs(diffX) > threshold) {
      diffX > 0
        ? safeScroll(getScrollAmount())
        : safeScroll(-getScrollAmount());
    }

    isDragging = false;
  }

  // Debounced Resize Handler
  const debouncedResize = debounce(updateButtonStates, 200);

  // Event Listeners
  prevButton.addEventListener("click", () => safeScroll(-getScrollAmount()));
  nextButton.addEventListener("click", () => safeScroll(getScrollAmount()));

  listElement.addEventListener("touchstart", handleTouchStart);
  listElement.addEventListener("touchmove", handleTouchMove);
  listElement.addEventListener("touchend", handleTouchEnd);

  window.addEventListener("resize", debouncedResize);

  // Initial Setup
  updateButtonStates();

  return {
    scrollNext: () => safeScroll(getScrollAmount()),
    scrollPrev: () => safeScroll(-getScrollAmount()),
    updateButtonStates,
  };
}
