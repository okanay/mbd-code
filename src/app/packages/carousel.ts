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

  function updateButtonStates() {
    const scrollPosition = listElement.scrollLeft;
    const maxScroll = listElement.scrollWidth - listElement.clientWidth;

    prevButton.disabled = scrollPosition <= 0;
    nextButton.disabled = scrollPosition >= maxScroll;
  }

  function getScrollAmount(direction: "next" | "prev") {
    const firstItem = listElement.children[0] as HTMLElement;
    const itemWidth = firstItem.offsetWidth + extraGap;
    const scrollAmount = itemWidth * itemsToScroll;

    const maxScroll = listElement.scrollWidth - listElement.clientWidth;
    const currentScroll = listElement.scrollLeft;

    if (direction === "next") {
      // Sınırı aşmamak için maksimum kaydırmayı kontrol et
      return Math.min(scrollAmount, maxScroll - currentScroll);
    } else {
      // Sınırı aşmamak için minimum kaydırmayı kontrol et
      return Math.min(scrollAmount, currentScroll);
    }
  }

  prevButton.addEventListener("click", () => {
    const scrollAmount = -getScrollAmount("prev");
    listElement.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
    setTimeout(updateButtonStates, 300);
  });

  nextButton.addEventListener("click", () => {
    const scrollAmount = getScrollAmount("next");
    listElement.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });
    setTimeout(updateButtonStates, 300);
  });

  listElement.addEventListener("scroll", updateButtonStates);
  window.addEventListener("load", updateButtonStates);
  window.addEventListener("resize", updateButtonStates);

  updateButtonStates();

  return {
    scrollNext: () => {
      const scrollAmount = getScrollAmount("next");
      listElement.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(updateButtonStates, 300);
    },
    scrollPrev: () => {
      const scrollAmount = -getScrollAmount("prev");
      listElement.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
      setTimeout(updateButtonStates, 300);
    },
    updateButtonStates,
  };
}

export { createCarousel };
