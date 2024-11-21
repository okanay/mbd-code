function createCarousel(
  listElement: HTMLElement,
  prevButton: HTMLButtonElement,
  nextButton: HTMLButtonElement,
  itemsToScroll = 1,
  extraGap = 16,
) {
  if (
    !listElement ||
    !listElement.children.length ||
    !prevButton ||
    !nextButton
  ) {
    console.error("Invalid carousel configuration");
    return;
  }

  let isScrolling = false; // Scroll lock to prevent overlapping animations

  function updateButtonStates() {
    const scrollPosition = listElement.scrollLeft;
    const maxScroll = listElement.scrollWidth - listElement.clientWidth;

    // Disable buttons if at boundaries
    prevButton.disabled = scrollPosition <= 0;
    nextButton.disabled = scrollPosition >= maxScroll;
  }

  function getScrollAmount() {
    const firstItem = listElement.children[0] as HTMLElement;
    return (firstItem.offsetWidth + extraGap) * itemsToScroll;
  }

  function scrollNext() {
    if (isScrolling) return; // Prevent overlapping scrolls
    isScrolling = true;

    const maxScroll = listElement.scrollWidth - listElement.clientWidth;
    const remainingScroll = maxScroll - listElement.scrollLeft;
    const scrollAmount = Math.min(getScrollAmount(), remainingScroll);

    listElement.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });

    // Delay until scrolling animation finishes
    setTimeout(() => {
      updateButtonStates();
      isScrolling = false;
    }, 750);
  }

  function scrollPrev() {
    if (isScrolling) return; // Prevent overlapping scrolls
    isScrolling = true;

    const scrollAmount = Math.min(getScrollAmount(), listElement.scrollLeft);

    listElement.scrollBy({
      left: -scrollAmount,
      behavior: "smooth",
    });

    setTimeout(() => {
      updateButtonStates();
      isScrolling = false;
    }, 750);
  }

  function resetScroll() {
    // Prevents overscrolling if spam occurs
    const maxScroll = listElement.scrollWidth - listElement.clientWidth;

    if (listElement.scrollLeft < 0) {
      listElement.scrollLeft = 0;
    } else if (listElement.scrollLeft > maxScroll) {
      listElement.scrollLeft = maxScroll;
    }
  }

  prevButton.addEventListener("click", scrollPrev);
  nextButton.addEventListener("click", scrollNext);

  // Reset scroll if spam or resize happens
  listElement.addEventListener("scroll", () => {
    resetScroll();
    updateButtonStates();
  });

  window.addEventListener("resize", () => {
    resetScroll();
    updateButtonStates();
  });

  // Initial setup
  updateButtonStates();

  return {
    scrollNext,
    scrollPrev,
    updateButtonStates,
  };
}

export { createCarousel };
