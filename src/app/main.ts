import { createCarousel } from "./packages/carousel.js";
import { lazyLoadImages } from "./packages/lazy-image-load.js";

const list = document.getElementById("activity-list") as HTMLElement;
const prevBtn = document.getElementById("prev-btn") as HTMLButtonElement;
const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;

createCarousel(list, prevBtn, nextBtn, {
  itemsToScroll: 2,
  snapAlign: "center",
  preventOverscroll: true,
  autoplay: {
    enabled: false,
    delay: 5000, // 5 saniyede bir otomatik kaydır
  },
});

const listMostPopular = document.getElementById(
  "activity-list-most-popular",
) as HTMLElement;
const prevBtnMostPopular = document.getElementById(
  "prev-btn-most-popular",
) as HTMLButtonElement;
const nextBtnMostPopular = document.getElementById(
  "next-btn-most-popular",
) as HTMLButtonElement;

createCarousel(listMostPopular, prevBtnMostPopular, nextBtnMostPopular, {
  itemsToScroll: 2,
  snapAlign: "center",
  preventOverscroll: true,
  autoplay: {
    enabled: false,
    delay: 5000, // 5 saniyede bir otomatik kaydır
  },
});

lazyLoadImages(".lazy-load");
