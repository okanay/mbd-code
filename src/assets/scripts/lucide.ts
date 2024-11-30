interface ScriptLoadOptions {
  async?: boolean
  defer?: boolean
  timeout?: number
}

export const loadScript = (
  src: string,
  options: ScriptLoadOptions = {},
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    if (options.async) script.async = true
    if (options.defer) script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))

    if (options.timeout) {
      setTimeout(() => {
        reject(new Error(`Script loading timed out: ${src}`))
      }, options.timeout)
    }
    document.head.appendChild(script)
  })
}

export const preloadScript = (src: string): void => {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.href = src
  link.as = 'script'
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)
}

// Önce preload yap

// Script'i yükle ve ikonları başlat
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Script'i yükle
    await loadScript('https://unpkg.com/lucide@latest', {
      async: true,
      timeout: 5000,
    })

    // İkonları oluştur
    if ((window as any).lucide) {
      ;(window as any).lucide.createIcons()
    } else {
      console.error('Lucide is not loaded.')
    }
  } catch (error) {
    console.error(error)
  }
})
