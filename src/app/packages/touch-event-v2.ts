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
  }

  private setupTouchListeners(): void {
    this.element.addEventListener(
      "touchstart",
      this.handleTouchStart.bind(this),
    );
    this.element.addEventListener("touchend", this.handleTouchEnd.bind(this));
  }

  private handleTouchStart(event: TouchEvent): void {
    const touch = event.touches[0];
    this.startX = touch.clientX;
    this.startY = touch.clientY;
  }

  private handleTouchEnd(event: TouchEvent): void {
    if (!event.changedTouches[0]) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - this.startX;
    const deltaY = touch.clientY - this.startY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (Math.abs(deltaX) >= this.threshold) {
        if (this.onSwipeCallback) {
          // Sağa kaydırma pozitif deltaX üretir, bu da 'prev' için 'right' yönü demektir
          // Sola kaydırma negatif deltaX üretir, bu da 'next' için 'left' yönü demektir
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
      "touchend",
      this.handleTouchEnd.bind(this),
    );
  }
}
