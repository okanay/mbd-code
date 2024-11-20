function lazyLoadImages(selector: string): void {
  const images = document.querySelectorAll<HTMLImageElement>(selector);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const highResSrc = img.getAttribute("data-src");

        if (highResSrc) {
          img.src = highResSrc;
          img.onload = () => (img.style.filter = "none");
          observer.unobserve(img); // Görsel yüklendikten sonra izlemeyi bırak
        }
      }
    });
  });

  images.forEach((img) => observer.observe(img));
}

export { lazyLoadImages };
