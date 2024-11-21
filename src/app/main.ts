import { createCarousel } from "./packages/carousel.js";
import { lazyLoadImages } from "./packages/lazy-image-load.js";

const list = document.getElementById("activity-list") as HTMLElement;
const prevBtn = document.getElementById("prev-btn") as HTMLButtonElement;
const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;

const carousel = createCarousel(list, {
  scrollMode: "precise",
  snapAlign: "center",
  itemSpacing: 16,
});

carousel.setupNavigationButtons(prevBtn, nextBtn);
carousel.scrollTo(1);

const listMostPopular = document.getElementById(
  "activity-list-most-popular",
) as HTMLElement;
const prevBtnMostPopular = document.getElementById(
  "prev-btn-most-popular",
) as HTMLButtonElement;
const nextBtnMostPopular = document.getElementById(
  "next-btn-most-popular",
) as HTMLButtonElement;

const carouselMost = createCarousel(listMostPopular, {
  scrollMode: "precise",
  snapAlign: "center",
  itemSpacing: 16,
});

carouselMost.setupNavigationButtons(prevBtnMostPopular, nextBtnMostPopular);
carouselMost.scrollTo(1);

lazyLoadImages(".lazy-load");
