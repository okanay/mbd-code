import { setupCarousel } from "./packages/carousel.js";
import { Slider } from "./packages/slider.js";
import { AccordionController } from "./packages/accordion.js";
import { ModalController } from "./packages/modal.js";

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

  new ModalController(
    [
      {
        id: "mobile-menu",
        triggerElements: ["#mobile-menu-button"],
        contentElement: "#mobile-navigation",
        closeElements: [],
        containers: ["#mobile-navigation-content"],
      },
      {
        id: "language-menu",
        triggerElements: [
          "#language-currency-selector-button",
          "#language-currency-selector-button-mobile",
        ],
        contentElement: "#language-currency-selector-options",
        closeElements: ["#language-selector-closed-button"],
        containers: ["#language-currency-selector-options-content"],
      },
    ],
    {
      outsideClickClose: true,
      escapeClose: true,
      closeOthersOnOpen: true,
      scrollLock: {
        enabled: true,
        styles: {
          hidden: {
            overflow: "hidden",
            position: "fixed",
            width: "100%",
          },
          visible: {
            overflow: "auto",
            position: "static",
            width: "auto",
          },
        },
      },
    },
  );

  new Slider({
    container: "#hero-slider-container",
    slideSelector: ".hero-slide",
    buttonSelector: ".hero-slider-btn",
    defaultActiveIndex: 0,
    activeButtonClass: "slider-active-btn",
    activeButtonClassTarget: ".hero-slider-btn-item",
    auto: true,
    autoInterval: 6000,
    animationConfig: {
      // TODO:: Direkt olan style degeri verilebilir mi yani init degeri exit degeri anim degeri gibi.
      duration: 1000,
      timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      transformSelectedInitialPos: "translate(120%, 0%)",
      transformNotSelectedExitPos: "translate(-20%, 0%)",
      opacitySelected: 1,
      opacityNotSelected: 0.75,
      scaleSelected: 1,
      scaleNotSelected: 1,
    },
    options: {
      zIndex: {
        selected: 30,
        clone: 40,
        notSelected: -10,
      },
    },
    onIndexChange: (index) => {
      if (!index && index !== 0) return;
      heroSliderCarousel?.scrollTo(index);
    },
  });

  new AccordionController({
    container: "#faq-container-1",
    accordionSelector: ".faq",
    toggleButtonSelector: ".faq-toggle",
    contentSelector: ".faq-content",
    iconSelector: ".faq-icon",
    defaultOpenIndex: 0,
    closeOthersOnOpen: true,
    animation: {
      enabled: true,
      duration: 300,
      timingFunction: "ease",
    },
    attributes: {
      stateAttribute: "data-state",
    },
    classes: {
      activeClass: "faq-active",
      inactiveClass: "faq-inactive",
    },
  });
});
