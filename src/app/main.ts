import { createCarousel } from "./packages/carousel.js";
import { lazyLoadImages } from "./packages/lazy-image-load.js";

const list = document.getElementById("activity-list") as HTMLElement;
const prevBtn = document.getElementById("prev-btn") as HTMLButtonElement;
const nextBtn = document.getElementById("next-btn") as HTMLButtonElement;

createCarousel(list, prevBtn, nextBtn, 1, 16);

const listMostPopular = document.getElementById(
  "activity-list-most-popular",
) as HTMLElement;
const prevBtnMostPopular = document.getElementById(
  "prev-btn-most-popular",
) as HTMLButtonElement;
const nextBtnMostPopular = document.getElementById(
  "next-btn-most-popular",
) as HTMLButtonElement;

createCarousel(listMostPopular, prevBtnMostPopular, nextBtnMostPopular, 1, 16);

lazyLoadImages(".lazy-load");
