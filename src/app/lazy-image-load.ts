import { lazyLoadImages } from "./packages/lazy-image-load.js";

document.addEventListener("DOMContentLoaded", () => {
  lazyLoadImages(".lazy-load");
});
