import { createCarousel } from "./packages/carousel.js";
import { lazyLoadImages } from "./packages/lazy-image-load.js";

// Güvenli element seçimi ve null kontrolü için yardımcı fonksiyon
function getByID<T extends HTMLElement>(selector: string): T | null {
  return document.getElementById(selector) as T | null;
}

// Güvenli carousel kurulum fonksiyonu
function setupCarousel(listId: string, prevBtnId: string, nextBtnId: string) {
  const list = getByID<HTMLElement>(listId);
  const prevBtn = getByID<HTMLButtonElement>(prevBtnId);
  const nextBtn = getByID<HTMLButtonElement>(nextBtnId);

  if (!list || !prevBtn || !nextBtn) {
    console.warn(`Carousel setup failed for ${listId}. Missing elements.`);
    return null;
  }

  const carousel = createCarousel(list, {
    snapAlign: "center",
    itemSpacing: 16,
    screenSizes: [
      { width: 512, items: 3 },
      { width: 768, items: 3 },
      { width: 1024, items: 3 },
    ],
  });

  carousel.setupNavigationButtons(prevBtn, nextBtn);

  return carousel;
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener("DOMContentLoaded", () => {
  // Lazy load resimleri
  lazyLoadImages(".lazy-load");

  // Her iki carousel için de güvenli kurulum
  setupCarousel("activity-list", "prev-btn", "next-btn");

  setupCarousel(
    "activity-list-most-popular",
    "prev-btn-most-popular",
    "next-btn-most-popular",
  );
});
