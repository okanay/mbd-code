import { Slider } from "./packages/slider.js";
import {
  ImageGalleryTracker,
  UpdateProductSliderDataItems,
} from "./packages/image-gallery.js";
import { ModalController } from "./packages/modal.js";
import { TouchDirectionDetector } from "./packages/touch-event.js";

document.addEventListener("DOMContentLoaded", () => {
  UpdateProductSliderDataItems("product-slider", {
    min: 1,
    max: 5,
    dataItems: "auto",
  });

  const gallery = new ImageGalleryTracker();

  const slider = new Slider({
    container: "#product-slider-container",
    slideSelector: ".product-slide",
    buttonSelector: ".product-slider-btn",
    defaultActiveIndex: 0,
    activeButtonClass: "product-slider-active-btn",
    activeButtonClassTarget: ".product-slider-btn-item",
    auto: true,
    autoInterval: 6000,
    animationConfig: {
      duration: 1000,
      timingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
      transforms: {
        fromLeft: {
          enter: "translate(-120%, 0%)",
          exit: "translate(20%, 0%)",
        },
        fromRight: {
          enter: "translate(120%, 0%)",
          exit: "translate(-20%, 0%)",
        },
      },
      opacitySelected: 1,
      opacityNotSelected: 0.75,
      scaleSelected: 1,
      scaleNotSelected: 1,
    },
    responsive: {
      enabled: true,
      minWidth: 0,
      maxWidth: 1024,
    },
    options: {
      zIndex: {
        clone: 40,
        selected: 30,
        notSelected: 20,
      },
    },
  });

  const sliderTouchDetector = new TouchDirectionDetector(
    "product-slider-container",
    {
      threshold: 50,
    },
  );

  sliderTouchDetector.onSwipe((direction) => {
    if (direction === "right") {
      return slider.prev();
    }

    if (direction === "left") {
      return slider.next();
    }
  });

  new ModalController(
    [
      {
        id: "gallery-modal",
        toggleElements: [".product-slide", "#gallery-modal-close-button"],
        contentElement: "#gallery-modal",
        closeElements: ["#gallery-modal-close-button"],
        containers: ["#gallery-modal-content"],
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
      onToggle: (_, __, trigger) => {
        const index = trigger?.getAttribute("data-index");
        const indexNumber = index ? parseInt(index, 10) : 0;
        gallery.openGallery(indexNumber);
      },
    },
  );
});
