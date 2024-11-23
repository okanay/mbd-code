interface LazyLoadOptions {
  imageSelector: string; // Görsellerin seçici ifadesi
  rootMargin?: string; // IntersectionObserver için rootMargin
  threshold?: number; // IntersectionObserver için threshold
  dataAttribute?: string; // Kullanıcı tarafından özelleştirilebilir veri attribute'u (ör. data-src, data-highquality)
  onLoadCallback?: (img: HTMLImageElement) => void; // Her görsel yüklendiğinde çağrılacak geri çağırım
  filterStyle?: string; // Yükleme öncesi uygulanan CSS filtre efekti
}

class LazyImageLoadController {
  private imageSelector: string;
  private rootMargin: string;
  private threshold: number;
  private dataAttribute: string;
  private onLoadCallback?: (img: HTMLImageElement) => void;
  private filterStyle: string;

  constructor(options: LazyLoadOptions) {
    const {
      imageSelector,
      rootMargin = "50px 0px",
      threshold = 0.1,
      dataAttribute = "data-src",
      onLoadCallback,
      filterStyle = "blur(10px)",
    } = options;

    this.imageSelector = imageSelector;
    this.rootMargin = rootMargin;
    this.threshold = threshold;
    this.dataAttribute = dataAttribute;
    this.onLoadCallback = onLoadCallback;
    this.filterStyle = filterStyle;

    this.init();
  }

  private init(): void {
    const images = document.querySelectorAll<HTMLImageElement>(
      this.imageSelector,
    );

    // Sadece dataAttribute'u olan ve henüz yüklenmemiş görselleri filtrele
    const notLoadedImages = Array.from(images).filter((img) => {
      const highResSrc = img.getAttribute(this.dataAttribute);
      return highResSrc && img.src !== highResSrc;
    });

    if (notLoadedImages.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const highResSrc = img.getAttribute(this.dataAttribute);

            if (highResSrc) {
              img.style.filter = this.filterStyle; // Yüklenmeden önce filtre uygula
              img.src = highResSrc;

              img.onload = () => {
                img.style.filter = "none"; // Yükleme sonrası filtreyi kaldır
                img.removeAttribute(this.dataAttribute);

                if (this.onLoadCallback) {
                  this.onLoadCallback(img); // Kullanıcı tanımlı geri çağırımı çalıştır
                }
              };

              observer.unobserve(img);
            }
          }
        });
      },
      {
        rootMargin: this.rootMargin,
        threshold: this.threshold,
      },
    );

    // Sadece yüklenmemiş görselleri observe et
    notLoadedImages.forEach((img) => observer.observe(img));
  }
}

export { LazyImageLoadController };
