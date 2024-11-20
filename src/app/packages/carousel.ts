function createCarousel(
  listElement: HTMLElement,
  prevButton: HTMLButtonElement,
  nextButton: HTMLButtonElement,
  itemsToScroll = 1,
  extraGap = 16,
) {
  // Ensure all required elements exist
  if (
    !listElement ||
    !listElement.children.length ||
    !prevButton ||
    !nextButton
  ) {
    console.error("Invalid carousel configuration");
    return;
  }

  // Update button states based on scroll position
  function updateButtonStates() {
    const scrollPosition = listElement.scrollLeft;
    const maxScroll = listElement.scrollWidth - listElement.clientWidth;

    prevButton.disabled = scrollPosition === 0;
    nextButton.disabled = scrollPosition >= maxScroll;
  }

  // Calculate scroll amount based on item width
  function getScrollAmount() {
    const firstItem = listElement.children[0] as HTMLElement;
    return (firstItem.offsetWidth + extraGap) * itemsToScroll;
  }

  // Add event listeners for navigation
  prevButton.addEventListener("click", () => {
    listElement.scrollBy({
      left: -getScrollAmount(),
      behavior: "smooth",
    });
    setTimeout(updateButtonStates, 300);
  });

  nextButton.addEventListener("click", () => {
    listElement.scrollBy({
      left: getScrollAmount(),
      behavior: "smooth",
    });
    setTimeout(updateButtonStates, 300);
  });

  // Initial and dynamic state tracking
  listElement.addEventListener("scroll", updateButtonStates);
  window.addEventListener("load", updateButtonStates);
  window.addEventListener("resize", updateButtonStates);

  // Initial button state setup
  updateButtonStates();

  // Return an object with methods to manually control the carousel if needed
  return {
    scrollNext: () => {
      listElement.scrollBy({
        left: getScrollAmount(),
        behavior: "smooth",
      });
      setTimeout(updateButtonStates, 300);
    },
    scrollPrev: () => {
      listElement.scrollBy({
        left: -getScrollAmount(),
        behavior: "smooth",
      });
      setTimeout(updateButtonStates, 300);
    },
    updateButtonStates,
  };
}

export { createCarousel };
