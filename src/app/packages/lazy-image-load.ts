export function lazyLoadImages(selector: string): void {
  const images = document.querySelectorAll<HTMLImageElement>(selector);

  // Sadece data-src'si olan ve henüz yüklenmemiş görselleri filtrele
  const notLoadedImages = Array.from(images).filter((img) => {
    const highResSrc = img.getAttribute("data-src");
    return highResSrc && img.src !== highResSrc;
  });

  // Eğer yüklenecek görsel yoksa erken çık
  if (notLoadedImages.length === 0) return;

  let loadedImagesCount = 0; // Yüklenen görsel sayısını takip et

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const highResSrc = img.getAttribute("data-src");

          if (highResSrc) {
            img.src = highResSrc;

            img.onload = () => {
              img.style.filter = "none";
              img.removeAttribute("data-src");
              loadedImagesCount++; // Yüklenen görsel sayısını artır

              // Tüm görseller yüklendiyse observer'ı kapat
              if (loadedImagesCount === notLoadedImages.length) {
                observer.disconnect();
              }
            };

            observer.unobserve(img);
          }
        }
      });
    },
    {
      rootMargin: "50px 0px", // Viewport'a girmeden önce yüklemeye başla
      threshold: 0.1, // Görselin %10'u göründüğünde yüklemeye başla
    },
  );

  // Sadece yüklenmemiş görselleri observe et
  notLoadedImages.forEach((img) => observer.observe(img));
}
