import {
  createCarousel,
  enhanceCarouselPerformance,
} from "./packages/carousel.js";
import { lazyLoadImages } from "./packages/lazy-image-load.js";

// Güvenli element seçimi ve null kontrolü için yardımcı fonksiyon
function safeGetElement<T extends HTMLElement>(selector: string): T | null {
  return document.getElementById(selector) as T | null;
}

// Güvenli carousel kurulum fonksiyonu
function setupCarousel(listId: string, prevBtnId: string, nextBtnId: string) {
  const list = safeGetElement<HTMLElement>(listId);
  const prevBtn = safeGetElement<HTMLButtonElement>(prevBtnId);
  const nextBtn = safeGetElement<HTMLButtonElement>(nextBtnId);

  if (!list || !prevBtn || !nextBtn) {
    console.warn(`Carousel setup failed for ${listId}. Missing elements.`);
    return null;
  }

  // Performans geliştirmesi
  enhanceCarouselPerformance(list);

  const carousel = createCarousel(list, {
    scrollMode: "precise",
    snapAlign: "center",
    itemSpacing: 16,
  });

  carousel.setupNavigationButtons(prevBtn, nextBtn);

  return carousel;
}

// Sayfa yüklendiğinde çalıştır
document.addEventListener("DOMContentLoaded", () => {
  // Lazy load resimleri
  lazyLoadImages(".lazy-load");

  // Her iki carousel için de güvenli kurulum
  const mainCarousel = setupCarousel("activity-list", "prev-btn", "next-btn");

  const mostPopularCarousel = setupCarousel(
    "activity-list-most-popular",
    "prev-btn-most-popular",
    "next-btn-most-popular",
  );

  // Opsiyonel: Hata ayıklama için carousel state'lerini logla
  if (mainCarousel) {
    console.log("Main Carousel Initial State:", mainCarousel.getCurrentState());
  }

  if (mostPopularCarousel) {
    console.log(
      "Most Popular Carousel Initial State:",
      mostPopularCarousel.getCurrentState(),
    );
  }
});

// Pencere yeniden boyutlandırıldığında carousel'ı güncelle
window.addEventListener("resize", () => {
  // Gerekirse carousel state'ini yeniden hesaplayabilirsiniz
});
