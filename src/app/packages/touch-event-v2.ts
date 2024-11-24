export class TouchDirectionDetector {
  private element: HTMLElement;
  private startX: number = 0;
  private startY: number = 0;
  private threshold: number;
  private onSwipeCallback?: (direction: "left" | "right") => void;

  constructor(elementId: string, options: { threshold?: number } = {}) {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found.`);
    }
    this.element = element;
    this.threshold = options.threshold || 50;
    this.setupTouchListeners();

    // Zoom ve scroll'u engellemek için touch-action özelliğini ayarla
    this.element.style.touchAction = "none";
  }

  private setupTouchListeners(): void {
    this.element.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
      { passive: false },
    );
    this.element.addEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
      { passive: false },
    );
    this.element.addEventListener("touchend", this.handleTouchEnd.bind(this), {
      passive: false,
    });
  }

  private handleTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
  }

  private handleTouchMove(event: TouchEvent): void {
    event.preventDefault();
  }

  private handleTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    if (!event.changedTouches[0]) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) >= this.threshold) {
        if (this.onSwipeCallback) {
          this.onSwipeCallback(deltaX > 0 ? "right" : "left");
        }
      }
    }
  }

  public onSwipe(callback: (direction: "left" | "right") => void): void {
    this.onSwipeCallback = callback;
  }

  public destroy(): void {
    this.element.removeEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
    );
    this.element.removeEventListener(
      "touchmove",
      this.handleTouchMove.bind(this),
    );
    this.element.removeEventListener(
      "touchend",
      this.handleTouchEnd.bind(this),
    );
  }
}
