import { Carousel } from "./packages/carousel-v2.js";
import { Slider } from "./packages/slider-v2.js";
import { AccordionController } from "./packages/accordion-v2.js";
import { ModalController } from "./packages/modal-v2.js";
import { LazyImageLoadController } from "./packages/lazy-load-controller-v2.js";

// Slider'ı başlat
document.addEventListener("DOMContentLoaded", () => {
  // new LazyImageLoadController({
  //   imageSelector: ".lazy-image",
  //   dataAttribute: "data-src",
  //   rootMargin: "100px 0px",
  //   threshold: 0.2,
  //   filterStyle: "blur(5px)",
  //   maxConcurrentLoads: 2,
  //   onLoadCallback: (img) => {
  //     console.log(`Görsel yüklendii: ${img.src}`);
  //   },
  // });

  const heroSliderCarousel = new Carousel(
    "hero-slider-btn-list",
    "prev-hero-slider-btn",
    "next-hero-slider-btn",
    {
      snapAlign: "center",
      itemSpacing: 16,
      btnsDisableThreshold: 32,
      screenSizes: [
        { width: 1024, jumpVal: 3 },
        { width: 768, jumpVal: 2 },
        { width: 512, jumpVal: 1 },
      ],
    },
  );

  new Carousel("most-popular", "prev-most-popular", "next-most-popular");
  new Carousel("popular-list", "prev-popular-list", "next-popular-list");
  new Carousel("holiday-list", "prev-holiday-list", "next-holiday-list");

  new ModalController(
    [
      {
        id: "language-menu",
        toggleElements: [
          "#language-currency-selector-button",
          "#language-currency-selector-button-mobile",
        ],
        contentElement: "#language-currency-selector-options",
        closeElements: ["#language-selector-closed-button"],
        containers: ["#language-currency-selector-options-content"],
      },
      {
        id: "mobile-menu",
        toggleElements: ["#mobile-menu-button"],
        contentElement: "#mobile-navigation",
        closeElements: [],
        containers: ["#mobile-navigation-content"],
      },
    ],
    {
      outsideClickClose: true,
      escapeClose: true,
      preserveModalHistory: true,
      attributes: {
        stateAttribute: "data-state",
        values: {
          open: "open",
          preserved: "open",
          hidden: "closed",
        },
      },
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

  const mobileFAQShowMore = new AccordionController({
    container: "#faq-container-2",
    accordionSelector: ".faq-2",
    toggleButtonSelector: ".faq-toggle-2",
    contentSelector: ".faq-content-2",
    iconSelector: ".faq-icon-2",
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

  new AccordionController({
    container: "#faq-container-3",
    accordionSelector: ".faq-3",
    toggleButtonSelector: ".faq-toggle-3",
    contentSelector: ".faq-content-3",
    iconSelector: ".faq-icon-3",
    defaultOpenIndex: -1,
    closeOthersOnOpen: false,
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
    onToggle: () => {
      setTimeout(() => {
        mobileFAQShowMore.recalculate();
      }, 150);
    },
  });
});
