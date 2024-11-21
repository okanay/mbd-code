import { createCarousel } from "./packages/carousel.js";

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
  });

  carousel.setupNavigationButtons(prevBtn, nextBtn);

  return carousel;
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener("DOMContentLoaded", () => {
  setupCarousel("activity-list", "prev-btn", "next-btn");
  setupCarousel("most-popular", "prev-most-popular", "next-most-popular");
  setupCarousel("popular-list", "prev-popular-list", "next-popular-list");
});
