import { setupCarousel } from "./packages/carousel.js";
import { Slider } from "./packages/slider.js";

// Slider'ı başlat
document.addEventListener("DOMContentLoaded", () => {
  const heroSliderCarousel = setupCarousel(
    "hero-slider-btn-list",
    "prev-hero-slider-btn",
    "next-hero-slider-btn",
  );

  setupCarousel("most-popular", "prev-most-popular", "next-most-popular");
  setupCarousel("popular-list", "prev-popular-list", "next-popular-list");
  setupCarousel("holiday-list", "prev-holiday-list", "next-holiday-list");

  new Slider({
    container: "#hero-slider-container",
    slideSelector: ".hero-slide",
    buttonSelector: ".hero-slider-btn",
    animationDuration: 1000,
    defaultActiveIndex: 0,
    activeButtonClass: "slider-active-btn",
    activeButtonClassTarget: ".hero-slider-btn-item",
    auto: true,
    autoInterval: 6000,
    onIndexChange: (index) => {
      if (!index && index !== 0) return;
      heroSliderCarousel?.scrollTo(index);
    },
    options: {
      zIndex: {
        selected: 30,
        clone: 40,
        notSelected: -10,
      },
    },
  });
});
