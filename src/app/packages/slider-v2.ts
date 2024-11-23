interface SliderAnimationConfig {
  duration?: number;
  timingFunction?: string;
  transformNotSelectedExitPos?: string;
  transformSelectedInitialPos?: string;
  opacitySelected?: number;
  opacityNotSelected?: number;
  scaleSelected?: number;
  scaleNotSelected?: number;
}

interface SliderConfig {
  container: string | HTMLElement;
  slideSelector: string;
  buttonSelector: string;
  animationConfig?: SliderAnimationConfig;
  defaultActiveIndex?: number;
  activeButtonClass?: string;
  activeButtonClassTarget?: string;
  auto?: boolean;
  autoInterval?: number;
  onIndexChange?: (index?: number) => void;
  options: {
    zIndex: {
      clone: number;
      selected: number;
      notSelected: number;
    };
  };
}

class Slider {
  private container: HTMLElement;
  private slider: HTMLElement;
  private slides: NodeListOf<HTMLElement>;
  private buttons: NodeListOf<HTMLButtonElement>;
  private activeIndex: number;
  private isAnimating: boolean;
  private activeButtonClass: string;
  private activeButtonClassTarget: string;
  private autoEnabled: boolean;
  private autoInterval: number;
  private autoTimer: NodeJS.Timeout | null;
  private onIndexChange?: (index?: number) => void;
  private options: {
    zIndex: {
      clone: number;
      selected: number;
      notSelected: number;
    };
  };
  private animationConfig: SliderAnimationConfig;

  constructor(config: SliderConfig) {
    // Container elementini al
    this.container =
      typeof config.container === "string"
        ? (document.querySelector(config.container) as HTMLElement)
        : config.container;

    if (!this.container) {
      throw new Error("Container element not found");
    }

    // Slider elementini bul
    this.slider = this.container.querySelector("ul") as HTMLElement;
    if (!this.slider) {
      throw new Error("Slider element not found");
    }

    // Slide ve butonları seç
    this.slides = this.container.querySelectorAll(config.slideSelector);
    this.buttons = document.querySelectorAll(config.buttonSelector);

    if (!this.slides.length || !this.buttons.length) {
      throw new Error("Slides or buttons not found");
    }

    // Default animation configuration
    this.animationConfig = {
      duration: config.animationConfig?.duration || 500,
      timingFunction: config.animationConfig?.timingFunction || "ease-in-out",
      transformNotSelectedExitPos:
        config.animationConfig?.transformNotSelectedExitPos || "translateX(0%)",
      transformSelectedInitialPos:
        config.animationConfig?.transformSelectedInitialPos ||
        "translateX(-100%)",
      opacitySelected: config.animationConfig?.opacitySelected || 1,
      opacityNotSelected: config.animationConfig?.opacityNotSelected || 0.85,
      scaleSelected: config.animationConfig?.scaleSelected || 1,
      scaleNotSelected: config.animationConfig?.scaleNotSelected || 0.85,
    };

    // Configden gelen değerleri ata
    this.activeIndex = config.defaultActiveIndex || 0;
    this.isAnimating = false;
    this.activeButtonClass = config.activeButtonClass || "slider-active-btn";
    this.activeButtonClassTarget =
      config.activeButtonClassTarget || config.buttonSelector;
    this.autoEnabled = config.auto || false;
    this.autoInterval = config.autoInterval || 5000;
    this.autoTimer = null;
    this.options = config.options || {
      zIndex: {
        clone: 60,
        selected: 50,
        notSelected: -10,
      },
    };
    this.onIndexChange = config.onIndexChange;
    this.init();
  }

  private init(): void {
    if (this.slides.length > 0) {
      this.slides.forEach((slide, index) => {
        if (index === this.activeIndex) {
          slide.style.zIndex = this.options.zIndex.selected.toString();
          slide.style.opacity = `${this.animationConfig.opacitySelected}`;
          slide.style.scale = `${this.animationConfig.scaleSelected}`;
        } else {
          slide.style.zIndex = this.options.zIndex.notSelected.toString();
          slide.style.opacity = `${this.animationConfig.opacityNotSelected}`;
          slide.style.scale = `${this.animationConfig.scaleNotSelected}`;
        }
      });
      this.updateActiveButton(this.activeIndex);
    }

    this.buttons.forEach((button: HTMLButtonElement) => {
      button.addEventListener("click", (e: Event) => {
        const target = button.getAttribute("data-target");
        const targetIndex = parseInt(target as string, 10);
        this.goToSlide(targetIndex);
      });
    });

    // Mouse over/out olaylarını dinle
    if (this.autoEnabled) {
      this.container.addEventListener("mouseenter", () => this.pauseAutoPlay());
      this.container.addEventListener("mouseleave", () =>
        this.resumeAutoPlay(),
      );
      this.startAutoPlay();
    }
  }

  private createCloneElement(sourceElement: HTMLElement): HTMLElement {
    const clone = sourceElement.cloneNode(true) as HTMLElement;
    clone.dataset.clone = "true";
    clone.style.transform = `${this.animationConfig.transformSelectedInitialPos}`;
    clone.style.transition = "none";
    clone.style.opacity = `${this.animationConfig.opacityNotSelected}`;
    clone.style.scale = `${this.animationConfig.scaleNotSelected}`;
    clone.style.zIndex = this.options.zIndex.clone.toString();
    return clone;
  }

  private updateActiveButton(targetIndex: number): void {
    const targetElements = document.querySelectorAll(
      this.activeButtonClassTarget,
    );

    targetElements.forEach((element: Element) => {
      (element as HTMLElement).classList.remove(this.activeButtonClass);
    });

    const activeButton = targetElements[targetIndex] as HTMLElement;
    if (activeButton) {
      activeButton.classList.add(this.activeButtonClass);
    }
  }

  private startAutoPlay(): void {
    if (this.autoEnabled) {
      this.autoTimer = setInterval(() => {
        this.next();
      }, this.autoInterval) as unknown as NodeJS.Timeout;
    }
  }

  private pauseAutoPlay(): void {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  private resumeAutoPlay(): void {
    this.pauseAutoPlay(); // Önceki timer'ı temizle
    this.startAutoPlay(); // Yeni timer başlat
  }

  private resetAutoPlayTimer(): void {
    if (this.autoEnabled) {
      this.pauseAutoPlay();
      this.startAutoPlay();
    }
  }

  public async goToSlide(targetIndex: number): Promise<void> {
    if (this.isAnimating || targetIndex === this.activeIndex) return;
    if (targetIndex < 0 || targetIndex >= this.slides.length) return;

    // Manuel geçiş yapıldığında timer'ı sıfırla
    this.resetAutoPlayTimer();

    this.isAnimating = true;
    const currentSlide = this.slides[this.activeIndex];
    const targetSlide = this.slides[targetIndex];

    this.updateActiveButton(targetIndex);

    const clone = this.createCloneElement(targetSlide);
    this.slider.appendChild(clone);

    clone.offsetHeight;

    requestAnimationFrame(() => {
      clone.style.transition = `${this.animationConfig.duration}ms ${this.animationConfig.timingFunction}`;
      clone.style.transform = `translateX(0%)`;
      clone.style.opacity = `${this.animationConfig.opacitySelected}`;
      clone.style.scale = `${this.animationConfig.scaleSelected}`;

      currentSlide.style.transition = `${this.animationConfig.duration}ms ${this.animationConfig.timingFunction}`;
      currentSlide.style.transform = `${this.animationConfig.transformNotSelectedExitPos}`;
      currentSlide.style.opacity = `${this.animationConfig.opacityNotSelected}`;
      currentSlide.style.scale = `${this.animationConfig.scaleNotSelected}`;
    });

    this.onIndexChange && this.onIndexChange(targetIndex);
    await new Promise((resolve) =>
      setTimeout(resolve, this.animationConfig.duration),
    );

    this.slides.forEach((slide: HTMLElement) => {
      slide.style.zIndex = this.options.zIndex.notSelected.toString();
      slide.style.transform = "translateX(0%)";
      slide.style.transition = "none";
      slide.style.opacity = `${this.animationConfig.opacitySelected}`;
      slide.style.scale = `${this.animationConfig.scaleSelected}`;
    });

    targetSlide.style.zIndex = this.options.zIndex.selected.toString();
    targetSlide.style.opacity = `${this.animationConfig.opacitySelected}`;
    targetSlide.style.scale = `${this.animationConfig.scaleSelected}`;
    clone.remove();

    this.activeIndex = targetIndex;
    this.isAnimating = false;
  }

  // Method to update animation configuration dynamically
  public updateAnimationConfig(config: SliderAnimationConfig): void {
    this.animationConfig = {
      ...this.animationConfig,
      ...config,
    };
  }

  // Public methods
  public getCurrentIndex(): number {
    return this.activeIndex;
  }

  public getSlidesCount(): number {
    return this.slides.length;
  }

  public next(): void {
    const nextIndex = (this.activeIndex + 1) % this.slides.length;
    this.goToSlide(nextIndex);
  }

  public prev(): void {
    const prevIndex =
      (this.activeIndex - 1 + this.slides.length) % this.slides.length;
    this.goToSlide(prevIndex);
  }

  // Auto play kontrolü için public metodlar
  public enableAutoPlay(): void {
    this.autoEnabled = true;
    this.startAutoPlay();
  }

  public disableAutoPlay(): void {
    this.autoEnabled = false;
    this.pauseAutoPlay();
  }

  // Slider'ı temizlemek için
  public destroy(): void {
    this.pauseAutoPlay();
    // Event listener'ları temizle
    this.container.removeEventListener("mouseenter", () =>
      this.pauseAutoPlay(),
    );
    this.container.removeEventListener("mouseleave", () =>
      this.resumeAutoPlay(),
    );
  }
}

export { Slider };
