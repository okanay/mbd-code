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

  let isScrolling = false; // Scrolling lock

  function updateButtonStates() {
    const scrollPosition = listElement.scrollLeft;
    const maxScroll = listElement.scrollWidth - listElement.clientWidth;
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

    const scrollAmount = Math.min(
      getScrollAmount(),
      listElement.scrollWidth -
        listElement.clientWidth -
        listElement.scrollLeft,
    );

    listElement.scrollBy({
      left: scrollAmount,
      behavior: "smooth",
    });

    setTimeout(() => {
      updateButtonStates();
      isScrolling = false; // Unlock scrolling
    }, 300); // Match this to the smooth scroll duration
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
      isScrolling = false; // Unlock scrolling
    }, 300); // Match this to the smooth scroll duration
  }

  prevButton.addEventListener("click", scrollPrev);
  nextButton.addEventListener("click", scrollNext);

  listElement.addEventListener("scroll", updateButtonStates);
  window.addEventListener("load", updateButtonStates);
  window.addEventListener("resize", updateButtonStates);

  updateButtonStates();

  return {
    scrollNext,
    scrollPrev,
    updateButtonStates,
  };
}

export { createCarousel };
